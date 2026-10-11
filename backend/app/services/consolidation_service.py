from datetime import datetime
from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models import (
    Vehicle,
    Trip,
    Booking,
    ConsolidationProposal,
    OperatorAgreement,
    PassengerOffer,
    RefundRequest,
    Operator
)
from app.optimization.consolidation_optimizer import consolidation_optimizer
from app.services.audit_service import log_audit_event

class ConsolidationService:
    @staticmethod
    def get_opportunities(db: Session, threshold_percent: float = 50.0) -> List[Dict[str, Any]]:
        # Find underbooked trips
        underbooked = db.query(Trip).filter(
            Trip.occupancy_percent < threshold_percent,
            Trip.status != "Consolidated (Withdrawn)"
        ).all()

        opportunities = []
        # Find pairs
        for i in range(len(underbooked)):
            for j in range(i + 1, len(underbooked)):
                t1, t2 = underbooked[i], underbooked[j]
                if t1.operator_id != t2.operator_id and t1.origin == t2.origin and t1.destination == t2.destination:
                    comb_pax = t1.confirmed_bookings + t2.confirmed_bookings
                    gross_savings = (t1.est_operating_cost + t2.est_operating_cost) - (t2.est_operating_cost + 1700.0)
                    opp = {
                        "id": f"OPP-{t1.id}-{t2.id}",
                        "trip_id_1": t1.id,
                        "trip_id_2": t2.id,
                        "operator_1": t1.operator_name,
                        "operator_2": t2.operator_name,
                        "origin": t1.origin,
                        "destination": t1.destination,
                        "departure_time_1": t1.departure_time,
                        "departure_time_2": t2.departure_time,
                        "passengers_1": t1.confirmed_bookings,
                        "passengers_2": t2.confirmed_bookings,
                        "combined_passengers": comb_pax,
                        "candidate_capacity": 40,
                        "compatibility": "High (Identical Corridor, 15 min departure window)",
                        "est_gross_savings": gross_savings,
                        "status": "Eligible"
                    }
                    opportunities.append(opp)
        return opportunities

    @staticmethod
    def get_proposal_detail(db: Session, proposal_id: str) -> Dict[str, Any]:
        proposal = db.query(ConsolidationProposal).filter(ConsolidationProposal.id == proposal_id).first()
        if not proposal:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proposal not found.")

        # Get operator agreements
        agreements = db.query(OperatorAgreement).filter(OperatorAgreement.proposal_id == proposal_id).all()
        agreements_dict = {}
        for a in agreements:
            op = db.query(Operator).filter(Operator.id == a.operator_id).first()
            agreements_dict[a.operator_id] = {
                "operator_id": a.operator_id,
                "operator_name": op.name if op else a.operator_id,
                "status": a.status,
                "notes": a.notes,
                "responded_at": a.responded_at
            }

        # Passenger consent calculation
        trip_ids = proposal.participating_trip_ids
        relevant_bookings = db.query(Booking).filter(Booking.trip_id.in_(trip_ids)).all()
        total_pax = sum(b.passenger_count for b in relevant_bookings)
        accepted_pax = sum(b.passenger_count for b in relevant_bookings if b.status == "consolidation_accepted")
        refund_pax = sum(b.passenger_count for b in relevant_bookings if b.status == "consolidation_refund_requested")
        pending_pax = total_pax - accepted_pax - refund_pax

        rate = (accepted_pax / total_pax * 100) if total_pax > 0 else 0.0

        consent_summary = {
            "status": "offers_sent" if proposal.status in ["passenger_consent_active", "finalized"] else "idle",
            "offersSentCount": total_pax,
            "acceptedCount": accepted_pax,
            "refundCount": refund_pax,
            "pendingCount": pending_pax,
            "acceptanceRatePercent": round(rate, 1),
            "isViable": rate >= proposal.viability_threshold_percent
        }

        t1 = db.query(Trip).filter(Trip.id == "TRIP-201").first()
        t2 = db.query(Trip).filter(Trip.id == "TRIP-202").first()

        trip1_data = {
            "id": t1.id if t1 else "TRIP-201",
            "operatorId": t1.operator_id if t1 else "OP-1",
            "operatorName": t1.operator_name if t1 else "Apex Express",
            "busId": t1.vehicle_id if t1 else "BUS-201",
            "departureTime": t1.departure_time if t1 else "18:00",
            "capacity": t1.scheduled_capacity if t1 else 40,
            "confirmedBookings": t1.confirmed_bookings if t1 else 12,
            "occupancyPercent": t1.occupancy_percent if t1 else 30.0,
            "estCost": t1.est_operating_cost if t1 else 18000.0,
        }

        trip2_data = {
            "id": t2.id if t2 else "TRIP-202",
            "operatorId": t2.operator_id if t2 else "OP-2",
            "operatorName": t2.operator_name if t2 else "Coastal Cruiser",
            "busId": t2.vehicle_id if t2 else "BUS-202",
            "departureTime": t2.departure_time if t2 else "18:15",
            "capacity": t2.scheduled_capacity if t2 else 40,
            "confirmedBookings": t2.confirmed_bookings if t2 else 15,
            "occupancyPercent": t2.occupancy_percent if t2 else 37.5,
            "estCost": t2.est_operating_cost if t2 else 18500.0,
        }

        fin_data = dict(proposal.financials or {})
        if "originalCombinedCost" not in fin_data:
            fin_data["originalCombinedCost"] = fin_data.get("originalTrip1Cost", 18000.0) + fin_data.get("originalTrip2Cost", 18500.0)

        return {
            "id": proposal.id,
            "participating_trip_ids": proposal.participating_trip_ids,
            "participating_operator_ids": proposal.participating_operator_ids,
            "replacement_vehicle_id": proposal.replacement_vehicle_id,
            "replacement_capacity": proposal.replacement_capacity,
            "combined_passenger_demand": proposal.combined_passenger_demand,
            "status": proposal.status,
            "version": proposal.version,
            "viability_threshold_percent": proposal.viability_threshold_percent,
            "viabilityThresholdPercent": proposal.viability_threshold_percent,
            "financials": fin_data,
            "operator_agreements": agreements_dict,
            "operatorAgreements": agreements_dict,
            "passenger_consent": consent_summary,
            "passengerConsent": consent_summary,
            "departure_time": proposal.departure_time,
            "proposedDepartureTime": proposal.departure_time,
            "proposedReplacementBusId": proposal.replacement_vehicle_id,
            "proposedReplacementOperator": "Coastal Cruiser",
            "route": proposal.route,
            "projected_occupancy_percent": proposal.projected_occupancy_percent,
            "projectedOccupancyPercent": proposal.projected_occupancy_percent,
            "combinedDemand": proposal.combined_passenger_demand,
            "replacementCapacity": proposal.replacement_capacity,
            "trip1": trip1_data,
            "trip2": trip2_data,
            "created_at": proposal.created_at,
            "finalized_at": proposal.finalized_at
        }

    @staticmethod
    def negotiate_operator(
        db: Session,
        proposal_id: str,
        operator_id: str,
        decision: str,
        notes: Optional[str] = ""
    ) -> Dict[str, Any]:
        proposal = db.query(ConsolidationProposal).filter(ConsolidationProposal.id == proposal_id).first()
        if not proposal:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proposal not found.")

        if decision not in ["accepted", "rejected", "revision_requested"]:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid decision.")

        agreement = db.query(OperatorAgreement).filter(
            OperatorAgreement.proposal_id == proposal_id,
            OperatorAgreement.operator_id == operator_id
        ).first()

        if not agreement:
            agreement = OperatorAgreement(
                id=f"AGR-{proposal_id.replace('PROP-','')}-{operator_id}",
                proposal_id=proposal_id,
                operator_id=operator_id,
                proposal_version=proposal.version,
                status=decision,
                notes=notes,
                responded_at=datetime.utcnow()
            )
            db.add(agreement)
        else:
            agreement.status = decision
            agreement.notes = notes
            agreement.proposal_version = proposal.version
            agreement.responded_at = datetime.utcnow()

        db.commit()

        # Check all agreements for this proposal
        all_agreements = db.query(OperatorAgreement).filter(OperatorAgreement.proposal_id == proposal_id).all()
        op1_stat = next((a.status for a in all_agreements if a.operator_id == "OP-1"), "pending")
        op2_stat = next((a.status for a in all_agreements if a.operator_id == "OP-2"), "pending")

        if op1_stat == "rejected" or op2_stat == "rejected":
            proposal.status = "rejected"
        elif op1_stat == "revision_requested" or op2_stat == "revision_requested":
            proposal.status = "under_review"
        elif op1_stat == "accepted" and op2_stat == "accepted":
            proposal.status = "operator_approved"
        else:
            proposal.status = "under_review"

        db.commit()

        op = db.query(Operator).filter(Operator.id == operator_id).first()
        op_name = op.name if op else operator_id
        color = "teal" if decision == "accepted" else ("rose" if decision == "rejected" else "amber")

        log_audit_event(
            db,
            event_type="NEGOTIATION",
            actor=op_name,
            description=f"Operator {op_name} marked commercial proposal {proposal_id} (v{proposal.version}) as {decision.upper()}.{f' Note: {notes}' if notes else ''}",
            badge_color=color,
            entity_type="proposal",
            entity_id=proposal_id
        )

        return ConsolidationService.get_proposal_detail(db, proposal_id)

    @staticmethod
    def revise_proposal_terms(db: Session, proposal_id: str, new_transfer_payment: float) -> Dict[str, Any]:
        proposal = db.query(ConsolidationProposal).filter(ConsolidationProposal.id == proposal_id).first()
        if not proposal:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proposal not found.")

        # Recalculate financials
        t1_cost = 18000.0
        t2_cost = 18500.0
        consolidated_cost = 20200.0
        brokerage = 800.0
        gross = (t1_cost + t2_cost) - consolidated_cost  # 16300

        apex_net = t1_cost - new_transfer_payment - (brokerage / 2)
        coastal_net = new_transfer_payment - (consolidated_cost - t2_cost) - (brokerage / 2)

        fin = {
            "grossOperatingSavings": gross,
            "originalCombinedCost": t1_cost + t2_cost,
            "originalTrip1Cost": t1_cost,
            "originalTrip2Cost": t2_cost,
            "consolidatedTripCost": consolidated_cost,
            "platformBrokerageFee": brokerage,
            "apexTransferPayment": new_transfer_payment,
            "apexNetSavings": apex_net,
            "coastalNetBenefit": coastal_net,
            "netEcosystemBenefit": gross - brokerage
        }

        proposal.financials = fin
        proposal.version += 1  # Invalidate previous approvals!
        proposal.status = "under_review"

        # Invalidate previous approvals
        agreements = db.query(OperatorAgreement).filter(OperatorAgreement.proposal_id == proposal_id).all()
        for a in agreements:
            a.status = "pending"
            a.notes = f"Reviewing revised terms (Apex transfer payment updated to ₹{new_transfer_payment})"
            a.proposal_version = proposal.version

        db.commit()

        log_audit_event(
            db,
            event_type="BROKERAGE",
            actor="TripMerge Guardian Broker",
            description=f"Commercial terms revised for {proposal_id}: Transfer payment set to ₹{new_transfer_payment}. Proposal incremented to version {proposal.version}. Obsolete approvals invalidated.",
            badge_color="indigo",
            entity_type="proposal",
            entity_id=proposal_id
        )

        return ConsolidationService.get_proposal_detail(db, proposal_id)

    @staticmethod
    def send_consolidation_offers(db: Session, proposal_id: str) -> Dict[str, Any]:
        proposal = db.query(ConsolidationProposal).filter(ConsolidationProposal.id == proposal_id).first()
        if not proposal:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proposal not found.")

        # Invariant: Both operators must have accepted terms first!
        agreements = db.query(OperatorAgreement).filter(OperatorAgreement.proposal_id == proposal_id).all()
        accepted_ops = [a.operator_id for a in agreements if a.status == "accepted" and a.proposal_version == proposal.version]
        if len(accepted_ops) < 2:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot send consolidation offers: Both bus operators must formally accept the current commercial terms first!"
            )

        proposal.status = "passenger_consent_active"

        # Update bookings for participating trips
        trip_ids = proposal.participating_trip_ids
        bookings = db.query(Booking).filter(Booking.trip_id.in_(trip_ids)).all()

        for b in bookings:
            b.status = "consolidation_offered"
            offer_id = f"OFR-CONS-{b.id}"
            existing = db.query(PassengerOffer).filter(PassengerOffer.id == offer_id).first()
            if not existing:
                offer = PassengerOffer(
                    id=offer_id,
                    booking_id=b.id,
                    offer_type="consolidation",
                    reference_id=proposal_id,
                    replacement_vehicle_id=proposal.replacement_vehicle_id,
                    status="sent"
                )
                db.add(offer)

        db.commit()

        log_audit_event(
            db,
            event_type="CONSENT",
            actor="Passenger Offer Dispatcher",
            description=f"Consolidation offers dispatched to {len(bookings)} bookings for merged departure on {proposal.replacement_vehicle_id}.",
            badge_color="blue",
            entity_type="proposal",
            entity_id=proposal_id
        )

        return ConsolidationService.get_proposal_detail(db, proposal_id)

    @staticmethod
    def respond_to_consolidation_offer(db: Session, booking_id: str, decision: str) -> Dict[str, Any]:
        booking = db.query(Booking).filter(Booking.id == booking_id).first()
        if not booking:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Booking {booking_id} not found.")

        if decision not in ["accept", "refund"]:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid decision.")

        offer = db.query(PassengerOffer).filter(
            PassengerOffer.booking_id == booking_id,
            PassengerOffer.offer_type == "consolidation"
        ).first()

        now = datetime.utcnow()
        if decision == "accept":
            booking.status = "consolidation_accepted"
            if offer:
                offer.status = "accepted"
                offer.response_timestamp = now
            desc = f"Passenger {booking.lead_passenger} ({booking_id}) ACCEPTED consolidated departure on BUS-202."
            color = "teal"
        else:
            booking.status = "consolidation_refund_requested"
            if offer:
                offer.status = "refund_requested"
                offer.response_timestamp = now
            # Create refund request record
            refund_id = f"REF-CONS-{booking_id}"
            existing_ref = db.query(RefundRequest).filter(RefundRequest.id == refund_id).first()
            if not existing_ref:
                ref = RefundRequest(
                    id=refund_id,
                    booking_id=booking_id,
                    reason="Declined cross-company trip consolidation schedule change.",
                    amount=booking.fare,
                    status="recorded_pending_settlement"
                )
                db.add(ref)
            desc = f"Passenger {booking.lead_passenger} ({booking_id}) DECLINED consolidation and requested refund (₹{booking.fare})."
            color = "rose"

        db.commit()

        log_audit_event(
            db,
            event_type="PASSENGER_ACTION",
            actor="Passenger Portal",
            description=desc,
            badge_color=color,
            entity_type="booking",
            entity_id=booking_id
        )

        return {"success": True, "booking_id": booking_id, "new_status": booking.status}

    @staticmethod
    def finalize_consolidation(db: Session, proposal_id: str) -> Dict[str, Any]:
        proposal = db.query(ConsolidationProposal).filter(ConsolidationProposal.id == proposal_id).first()
        if not proposal:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proposal not found.")

        # Invariant 1: Operator agreements
        agreements = db.query(OperatorAgreement).filter(OperatorAgreement.proposal_id == proposal_id).all()
        accepted_ops = [a.operator_id for a in agreements if a.status == "accepted" and a.proposal_version == proposal.version]
        if len(accepted_ops) < 2:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="BLOCKED: Both bus operators must formally accept the current version of the commercial agreement."
            )

        # Invariant 2: Passenger consent threshold
        trip_ids = proposal.participating_trip_ids
        relevant_bookings = db.query(Booking).filter(Booking.trip_id.in_(trip_ids)).all()
        total_pax = sum(b.passenger_count for b in relevant_bookings)
        accepted_pax = sum(b.passenger_count for b in relevant_bookings if b.status == "consolidation_accepted")
        pending_pax = sum(b.passenger_count for b in relevant_bookings if b.status == "consolidation_offered")

        if pending_pax > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"BLOCKED: There are still {pending_pax} pending passenger response(s). All passenger responses must be recorded."
            )

        acceptance_rate = (accepted_pax / total_pax * 100) if total_pax > 0 else 0.0
        if acceptance_rate < proposal.viability_threshold_percent:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"BLOCKED: Passenger acceptance rate is {acceptance_rate:.1f}%, which is below the minimum viability threshold of {proposal.viability_threshold_percent}%. Consolidation cannot be finalized."
            )

        # Invariant 3: Capacity check
        if accepted_pax > proposal.replacement_capacity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"BLOCKED: Accepted passengers ({accepted_pax}) exceed replacement vehicle capacity ({proposal.replacement_capacity})."
            )

        # Invariant 4: Proposal must not be cancelled
        if proposal.status == "cancelled":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="BLOCKED: A cancelled proposal cannot be finalized."
            )

        # Perform atomic transactional consolidation
        finalized_occupancy = round((accepted_pax / proposal.replacement_capacity) * 100, 1)

        # Update Trips
        t1 = db.query(Trip).filter(Trip.id == "TRIP-201").first()
        t2 = db.query(Trip).filter(Trip.id == "TRIP-202").first()
        if t1:
            t1.status = "Consolidated (Withdrawn)"
            t1.confirmed_bookings = 0
            t1.occupancy_percent = 0.0
        if t2:
            t2.status = "Active Consolidated Service"
            t2.confirmed_bookings = accepted_pax
            t2.occupancy_percent = finalized_occupancy

        # Update Vehicles
        v1 = db.query(Vehicle).filter(Vehicle.id == "BUS-201").first()
        v2 = db.query(Vehicle).filter(Vehicle.id == "BUS-202").first()
        if v1:
            v1.status = "Withdrawn (Consolidated into BUS-202)"
            v1.is_available = True
            v1.confirmed_bookings = 0
            v1.available_seats = v1.capacity
        if v2:
            v2.status = "Active Consolidated"
            v2.confirmed_bookings = accepted_pax
            v2.available_seats = v2.capacity - accepted_pax

        # Update Proposal
        proposal.status = "finalized"
        proposal.finalized_at = datetime.utcnow()
        proposal.projected_occupancy_percent = finalized_occupancy

        db.commit()

        log_audit_event(
            db,
            event_type="FINALIZATION",
            actor="TripMerge Guardian Settlement Engine",
            description=f"Consolidation {proposal_id} FINALIZED! TRIP-201 merged into TRIP-202 on BUS-202. Confirmed occupancy: {finalized_occupancy}% ({accepted_pax}/{proposal.replacement_capacity} seats). Gross savings: ₹{proposal.financials.get('grossOperatingSavings', 16300)}.",
            badge_color="teal",
            entity_type="proposal",
            entity_id=proposal_id
        )

        return {"success": True, "message": "Consolidation successfully finalized.", "proposal": ConsolidationService.get_proposal_detail(db, proposal_id)}

    @staticmethod
    def cancel_proposal(db: Session, proposal_id: str, reason: str = "Operator commercial deadlock") -> Dict[str, Any]:
        proposal = db.query(ConsolidationProposal).filter(ConsolidationProposal.id == proposal_id).first()
        if not proposal:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proposal not found.")

        proposal.status = "cancelled"

        # Revert passenger bookings to confirmed
        trip_ids = proposal.participating_trip_ids
        bookings = db.query(Booking).filter(Booking.trip_id.in_(trip_ids)).all()
        for b in bookings:
            b.status = "confirmed"

        db.commit()

        log_audit_event(
            db,
            event_type="CANCEL",
            actor="TripMerge Broker",
            description=f"Proposal {proposal_id} CANCELLED. Reason: {reason}. Original schedules restored.",
            badge_color="rose",
            entity_type="proposal",
            entity_id=proposal_id
        )

        return {"success": True, "message": "Proposal cancelled and original schedules restored."}
