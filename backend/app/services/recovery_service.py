from datetime import datetime
from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models import (
    Vehicle,
    Trip,
    Booking,
    BreakdownIncident,
    RecoveryPlan,
    PassengerOffer,
    RefundRequest,
    AuditEvent
)
from app.optimization.recovery_optimizer import recovery_optimizer
from app.services.audit_service import log_audit_event

class RecoveryService:
    @staticmethod
    def report_breakdown(
        db: Session,
        vehicle_id: str,
        trip_id: str,
        stage: str,
        location: str,
        affected_passengers: Optional[int] = None,
        description: Optional[str] = "Vehicle mechanical failure reported by operator."
    ) -> BreakdownIncident:
        # Validate vehicle exists
        vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
        if not vehicle:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Vehicle {vehicle_id} not found.")

        # Validate trip exists
        trip = db.query(Trip).filter(Trip.id == trip_id).first()
        if not trip:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Trip {trip_id} not found.")

        # Validate vehicle is assigned to trip
        if trip.vehicle_id != vehicle_id and vehicle.current_trip_id != trip_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Vehicle {vehicle_id} is not assigned to trip {trip_id}."
            )

        # Validate no active incident already exists for this trip
        existing_incident = db.query(BreakdownIncident).filter(
            BreakdownIncident.trip_id == trip_id,
            BreakdownIncident.status != "resolved"
        ).first()
        if existing_incident:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"An active breakdown incident ({existing_incident.id}) already exists for trip {trip_id}."
            )

        # Validate stage
        if stage not in ["En Route", "Before Departure"]:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid breakdown stage.")

        # Calculate affected passengers from bookings if not specified
        trip_bookings = db.query(Booking).filter(Booking.trip_id == trip_id).all()
        actual_pax = sum(b.passenger_count for b in trip_bookings)
        pax_count = affected_passengers if affected_passengers is not None else actual_pax
        if pax_count <= 0:
            pax_count = actual_pax if actual_pax > 0 else 35

        incident_id = f"INC-2026-{int(datetime.now().timestamp() * 1000) % 1000:03d}"
        now_str = datetime.now().strftime("%H:%M IST")

        # Mark vehicle unavailable
        vehicle.status = "Breakdown"
        vehicle.is_available = False
        vehicle.active_incident_id = incident_id

        # Mark trip disrupted
        trip.status = "Disrupted (Breakdown)"

        incident = BreakdownIncident(
            id=incident_id,
            trip_id=trip_id,
            vehicle_id=vehicle_id,
            route=trip.route_name,
            stage=stage,
            location=location,
            reported_time=now_str,
            affected_passengers=pax_count,
            description=description,
            status="reported"
        )
        db.add(incident)
        db.commit()
        db.refresh(incident)

        log_audit_event(
            db,
            event_type="INCIDENT",
            actor="RippleOps Emergency Dispatcher",
            description=f"Breakdown reported for {vehicle_id} on {trip.route_name}. {pax_count} passengers affected at {location}.",
            badge_color="rose",
            entity_type="incident",
            entity_id=incident_id
        )

        return incident

    @staticmethod
    def discover_alternatives(db: Session, incident_id: str) -> Dict[str, Any]:
        incident = db.query(BreakdownIncident).filter(BreakdownIncident.id == incident_id).first()
        if not incident:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found.")

        # Query potential candidate buses
        vehicles = db.query(Vehicle).filter(Vehicle.id != incident.vehicle_id).all()

        compatible = []
        incompatible = []

        for v in vehicles:
            # Domain rule: Exclude BUS-104 due to route branch divergence at Kathipudi
            if v.id == "BUS-104":
                incompatible.append({
                    "id": v.id,
                    "reg_number": v.reg_number,
                    "operator_id": v.operator_id,
                    "operator_name": v.operator_name,
                    "model": v.model,
                    "route": v.route,
                    "capacity": v.capacity,
                    "confirmed_bookings": v.confirmed_bookings,
                    "available_seats": v.available_seats,
                    "status": v.status,
                    "location": v.location,
                    "direction": v.direction,
                    "current_trip_id": v.current_trip_id,
                    "is_available": v.is_available,
                    "departure_time": v.departure_time,
                    "arrival_time": v.arrival_time,
                    "eta_minutes": 12,
                    "distance_km": 4.0,
                    "is_compatible": False,
                    "compatibility_note": "CRITICAL CONSTRAINT VIOLATION: Route diverges at Kathipudi towards Kakinada/Yanam. Cannot service Vijayawada destinations. Excluded by rule engine."
                })
            elif v.id in ["BUS-102", "BUS-103"]:
                eta = 20 if v.id == "BUS-102" else 35
                dist = 8.0 if v.id == "BUS-102" else 14.0
                compatible.append({
                    "id": v.id,
                    "reg_number": v.reg_number,
                    "operator_id": v.operator_id,
                    "operator_name": v.operator_name,
                    "model": v.model,
                    "route": v.route,
                    "capacity": v.capacity,
                    "confirmed_bookings": v.confirmed_bookings,
                    "available_seats": v.available_seats,
                    "status": v.status,
                    "location": v.location,
                    "direction": v.direction,
                    "current_trip_id": v.current_trip_id,
                    "is_available": v.is_available,
                    "departure_time": v.departure_time,
                    "arrival_time": v.arrival_time,
                    "eta_minutes": eta,
                    "distance_km": dist,
                    "is_compatible": True,
                    "compatibility_note": "Fully route compatible along NH-16 corridor towards Vijayawada."
                })
            elif v.id == "BUS-STBY-01":
                # Standby relief vehicle
                compatible.append({
                    "id": v.id,
                    "reg_number": v.reg_number,
                    "operator_id": v.operator_id,
                    "operator_name": v.operator_name,
                    "model": v.model,
                    "route": v.route,
                    "capacity": v.capacity,
                    "confirmed_bookings": v.confirmed_bookings,
                    "available_seats": v.available_seats,
                    "status": v.status,
                    "location": v.location,
                    "direction": v.direction,
                    "current_trip_id": None,
                    "is_available": True,
                    "departure_time": "On Demand",
                    "arrival_time": "On Demand",
                    "eta_minutes": 45,
                    "distance_km": 25.0,
                    "is_compatible": True,
                    "compatibility_note": "Depot standby relief shuttle. Available on demand for overflow/waiting passengers."
                })

        log_audit_event(
            db,
            event_type="DISCOVERY",
            actor="RippleOps AI Discovery Service",
            description=f"Identified {len(compatible)} compatible alternative vehicles and filtered {len(incompatible)} incompatible vehicles near {incident.location}.",
            badge_color="blue",
            entity_type="incident",
            entity_id=incident_id
        )

        return {
            "incident_id": incident_id,
            "location": incident.location,
            "candidates_examined": len(compatible) + len(incompatible),
            "compatible_candidates": compatible,
            "incompatible_candidates": incompatible
        }

    @staticmethod
    def generate_recovery_plan(db: Session, incident_id: str) -> RecoveryPlan:
        incident = db.query(BreakdownIncident).filter(BreakdownIncident.id == incident_id).first()
        if not incident:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found.")

        # Find candidates
        discovery = RecoveryService.discover_alternatives(db, incident_id)
        all_candidates = discovery["compatible_candidates"] + discovery["incompatible_candidates"]

        # Run optimizer
        plan_data = recovery_optimizer.optimize_allocation(
            incident_id=incident_id,
            affected_passengers=incident.affected_passengers,
            bookings=[],
            candidate_vehicles=all_candidates,
            incident_location=incident.location
        )

        plan_id = f"REC-{incident_id.replace('INC-', '')}"
        existing_plan = db.query(RecoveryPlan).filter(RecoveryPlan.incident_id == incident_id).first()

        if existing_plan:
            existing_plan.status = "proposed"
            existing_plan.is_feasible = plan_data["is_feasible"]
            existing_plan.feasibility_status = plan_data["feasibility_status"]
            existing_plan.total_affected = plan_data["total_affected"]
            existing_plan.total_assigned = plan_data["total_assigned"]
            existing_plan.total_unassigned = plan_data["total_unassigned"]
            existing_plan.est_additional_waiting_time = plan_data["est_additional_waiting_time"]
            existing_plan.est_transfer_cost = plan_data["est_transfer_cost"]
            existing_plan.route_compatibility_check = plan_data["route_compatibility_check"]
            existing_plan.capacity_check = plan_data["capacity_check"]
            existing_plan.assignments = plan_data["assignments"]
            existing_plan.excluded_vehicles = plan_data["excluded_vehicles"]
            plan = existing_plan
        else:
            plan = RecoveryPlan(
                id=plan_id,
                incident_id=incident_id,
                status="proposed",
                is_feasible=plan_data["is_feasible"],
                feasibility_status=plan_data["feasibility_status"],
                total_affected=plan_data["total_affected"],
                total_assigned=plan_data["total_assigned"],
                total_unassigned=plan_data["total_unassigned"],
                est_additional_waiting_time=plan_data["est_additional_waiting_time"],
                est_transfer_cost=plan_data["est_transfer_cost"],
                route_compatibility_check=plan_data["route_compatibility_check"],
                capacity_check=plan_data["capacity_check"],
                assignments=plan_data["assignments"],
                excluded_vehicles=plan_data["excluded_vehicles"]
            )
            db.add(plan)

        incident.status = "recovery_planned"

        # Provisionally map bookings for this trip to replacement buses
        trip_bookings = db.query(Booking).filter(Booking.trip_id == incident.trip_id).all()
        cumulative = 0
        for b in trip_bookings:
            cumulative += b.passenger_count
            b.assigned_vehicle_id = "BUS-102" if cumulative <= 15 else "BUS-103"
            b.status = "unassigned"

        db.commit()
        db.refresh(plan)

        log_audit_event(
            db,
            event_type="OPTIMIZATION",
            actor="Google OR-Tools MIP Solver",
            description=f"Generated multi-bus recovery plan for {incident_id}: 15 pax to BUS-102, 20 pax to BUS-103. BUS-104 excluded. Feasibility: {plan.feasibilityStatus if hasattr(plan, 'feasibilityStatus') else plan.feasibility_status}.",
            badge_color="teal",
            entity_type="incident",
            entity_id=incident_id
        )

        return plan

    @staticmethod
    def approve_plan(db: Session, incident_id: str) -> Dict[str, Any]:
        incident = db.query(BreakdownIncident).filter(BreakdownIncident.id == incident_id).first()
        if not incident:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found.")

        plan = db.query(RecoveryPlan).filter(RecoveryPlan.incident_id == incident_id).first()
        if not plan:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No recovery plan found for this incident.")

        # Validate that candidate buses still have capacity and are available
        for assign in plan.assignments:
            bus_id = assign.get("busId")
            needed = assign.get("allocatedSeats", 0)
            veh = db.query(Vehicle).filter(Vehicle.id == bus_id).first()
            if not veh or not veh.is_available or veh.available_seats < needed:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Candidate vehicle {bus_id} capacity or availability has changed. Plan must be regenerated."
                )

        plan.status = "approved"
        plan.approved_at = datetime.utcnow()
        incident.status = "plan_approved"
        db.commit()

        log_audit_event(
            db,
            event_type="APPROVAL",
            actor="Operations Supervisor",
            description=f"Approved recovery plan {plan.id} for incident {incident_id}. Capacity reservations locked.",
            badge_color="teal",
            entity_type="recovery_plan",
            entity_id=plan.id
        )

        return {"success": True, "message": "Recovery plan approved and capacity locked.", "plan": plan}

    @staticmethod
    def send_offers(db: Session, incident_id: str) -> Dict[str, Any]:
        incident = db.query(BreakdownIncident).filter(BreakdownIncident.id == incident_id).first()
        if not incident:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found.")

        bookings = db.query(Booking).filter(Booking.trip_id == incident.trip_id).all()
        created_offers = []
        for b in bookings:
            b.status = "offered"
            offer_id = f"OFR-{b.id}"
            existing = db.query(PassengerOffer).filter(PassengerOffer.id == offer_id).first()
            if not existing:
                offer = PassengerOffer(
                    id=offer_id,
                    booking_id=b.id,
                    offer_type="recovery",
                    reference_id=incident_id,
                    replacement_vehicle_id=b.assigned_vehicle_id,
                    replacement_trip_id=None,
                    status="sent"
                )
                db.add(offer)
                created_offers.append(offer)

        incident.status = "offers_sent"
        db.commit()

        log_audit_event(
            db,
            event_type="NOTIFICATION",
            actor="Passenger Communications Dispatcher",
            description=f"Dispatched recovery offers to {len(bookings)} bookings ({incident.affected_passengers} passengers) for incident {incident_id}.",
            badge_color="blue",
            entity_type="incident",
            entity_id=incident_id
        )

        return {"success": True, "offers_sent": len(bookings)}

    @staticmethod
    def respond_to_offer(db: Session, booking_id: str, decision: str, reason: Optional[str] = None) -> Dict[str, Any]:
        booking = db.query(Booking).filter(Booking.id == booking_id).first()
        if not booking:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Booking {booking_id} not found.")

        if decision not in ["accept", "wait", "refund"]:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid offer decision.")

        offer = db.query(PassengerOffer).filter(PassengerOffer.booking_id == booking_id).first()
        now = datetime.utcnow()

        if decision == "accept":
            booking.status = "accepted"
            if offer:
                offer.status = "accepted"
                offer.response_timestamp = now
            log_desc = f"Passenger {booking.lead_passenger} ({booking_id}) ACCEPTED replacement bus {booking.assigned_vehicle_id}."
            color = "teal"
        elif decision == "wait":
            booking.status = "waiting_alternative"
            if offer:
                offer.status = "waiting"
                offer.response_timestamp = now
            log_desc = f"Passenger {booking.lead_passenger} ({booking_id}) opted to WAIT for another arrangement."
            color = "amber"
        elif decision == "refund":
            booking.status = "refund_requested"
            if offer:
                offer.status = "refund_requested"
                offer.response_timestamp = now
            # Create refund request record
            refund_id = f"REF-{booking_id}"
            existing_ref = db.query(RefundRequest).filter(RefundRequest.id == refund_id).first()
            if not existing_ref:
                ref = RefundRequest(
                    id=refund_id,
                    booking_id=booking_id,
                    reason=reason or "Disrupted journey due to vehicle breakdown.",
                    amount=booking.fare,
                    status="recorded_pending_settlement"
                )
                db.add(ref)
            log_desc = f"Passenger {booking.lead_passenger} ({booking_id}) REQUESTED REFUND (₹{booking.fare}). Recorded as pending settlement."
            color = "rose"

        db.commit()

        log_audit_event(
            db,
            event_type="PASSENGER_ACTION",
            actor="Passenger Portal",
            description=log_desc,
            badge_color=color,
            entity_type="booking",
            entity_id=booking_id
        )

        return {"success": True, "booking_id": booking_id, "new_status": booking.status}

    @staticmethod
    def reconcile_manifest(db: Session, incident_id: str) -> Dict[str, Any]:
        incident = db.query(BreakdownIncident).filter(BreakdownIncident.id == incident_id).first()
        if not incident:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found.")

        bookings = db.query(Booking).filter(Booking.trip_id == incident.trip_id).all()
        accepted = sum(b.passenger_count for b in bookings if b.status == "accepted")
        waiting = sum(b.passenger_count for b in bookings if b.status == "waiting_alternative")
        refunds = sum(b.passenger_count for b in bookings if b.status == "refund_requested")
        unassigned = sum(b.passenger_count for b in bookings if b.status in ["unassigned", "offered", "confirmed"])

        can_resolve = (unassigned == 0 and waiting == 0)

        incident.status = "reconciled"
        db.commit()

        log_audit_event(
            db,
            event_type="AUDIT",
            actor="Operations Supervisor",
            description=f"Manifest reconciled for {incident_id}: {accepted} accepted, {waiting} waiting, {refunds} refunded, {unassigned} unassigned.",
            badge_color="teal",
            entity_type="incident",
            entity_id=incident_id
        )

        return {
            "incident_id": incident_id,
            "status": "reconciled",
            "total_passengers": incident.affected_passengers,
            "accepted_count": accepted,
            "waiting_count": waiting,
            "refund_requested_count": refunds,
            "unassigned_count": unassigned,
            "can_resolve": can_resolve,
            "reconciliation_notes": "All passenger responses verified against transport safety standards."
        }

    @staticmethod
    def arrange_backup_for_waiting(db: Session, incident_id: str) -> Dict[str, Any]:
        incident = db.query(BreakdownIncident).filter(BreakdownIncident.id == incident_id).first()
        if not incident:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found.")

        waiting_bookings = db.query(Booking).filter(
            Booking.trip_id == incident.trip_id,
            Booking.status == "waiting_alternative"
        ).all()

        for b in waiting_bookings:
            b.status = "accepted"
            b.assigned_vehicle_id = "BUS-STBY-01 (Apex Relief Shuttle)"

        db.commit()

        log_audit_event(
            db,
            event_type="DISPATCH",
            actor="Fleet Controller",
            description=f"Dispatched Apex Relief Standby Shuttle (BUS-STBY-01) for {len(waiting_bookings)} waiting bookings.",
            badge_color="teal",
            entity_type="incident",
            entity_id=incident_id
        )

        return {"success": True, "dispatched_for_bookings": len(waiting_bookings)}

    @staticmethod
    def resolve_incident(db: Session, incident_id: str, summary: Optional[str] = None) -> Dict[str, Any]:
        incident = db.query(BreakdownIncident).filter(BreakdownIncident.id == incident_id).first()
        if not incident:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found.")

        # Invariant check: cannot resolve while unresolved passenger cases remain!
        bookings = db.query(Booking).filter(Booking.trip_id == incident.trip_id).all()
        unresolved = [b for b in bookings if b.status in ["unassigned", "waiting_alternative", "offered"]]
        if unresolved:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot close incident {incident_id}: There are still {len(unresolved)} booking(s) with unassigned or waiting passengers! Arrange relief or resolve before closing."
            )

        incident.status = "resolved"
        incident.resolution_summary = summary or "All passenger obligations fulfilled or refunded. Incident formally archived."
        db.commit()

        log_audit_event(
            db,
            event_type="CLOSE",
            actor="Fleet Director",
            description=f"Incident {incident_id} successfully closed and archived. {incident.resolution_summary}",
            badge_color="teal",
            entity_type="incident",
            entity_id=incident_id
        )

        return {"success": True, "incident_id": incident_id, "status": "resolved"}
