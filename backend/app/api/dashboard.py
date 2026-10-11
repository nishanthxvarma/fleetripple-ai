from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import (
    Vehicle,
    Trip,
    Booking,
    BreakdownIncident,
    ConsolidationProposal
)

router = APIRouter(prefix="/dashboard")

@router.get("/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    buses = db.query(Vehicle).all()
    trips = db.query(Trip).all()
    incidents = db.query(BreakdownIncident).all()
    proposals = db.query(ConsolidationProposal).all()
    bookings = db.query(Booking).all()

    total_buses = len(buses)
    avail_buses = len([b for b in buses if b.is_available and b.status != "Breakdown"])
    active_incidents = len([i for i in incidents if i.status != "resolved"])

    # Unassigned passengers on TRIP-101
    unassigned_pax = sum(
        b.passenger_count for b in bookings
        if b.trip_id == "TRIP-101" and b.status in ["unassigned", "waiting_alternative"]
    )

    # Underbooked trips
    underbooked_trips = len([
        t for t in trips
        if "Underbooked" in t.status or (t.occupancy_percent < 50 and t.status != "Consolidated (Withdrawn)")
    ])

    # Pending operator agreements
    pending_agreements = len([p for p in proposals if p.status in ["draft", "under_review"]])

    # Pending passenger responses
    pending_pax_responses = len([b for b in bookings if b.status in ["offered", "consolidation_offered"]])

    # Total illustrative gross savings from proposals
    total_savings = sum(
        p.financials.get("grossOperatingSavings", 0) for p in proposals
        if p.status in ["draft", "operator_approved", "passenger_consent_active", "finalized"]
    )

    return {
        "totalBusesCount": total_buses,
        "availableBusesCount": avail_buses,
        "activeBreakdownsCount": active_incidents,
        "unassignedPassengersCount": unassigned_pax,
        "underbookedTripsCount": underbooked_trips,
        "pendingOperatorAgreementsCount": pending_agreements,
        "pendingPassengerResponsesCount": pending_pax_responses,
        "totalIllustrativeSavings": total_savings,
        "corridorSummary": {
            "corridor": "NH-16 Visakhapatnam - Vijayawada",
            "activeVehiclesCount": total_buses,
            "incidentVehiclesCount": active_incidents,
            "monitoredCorridorKm": 350
        }
    }

@router.get("/action-queue")
def get_action_queue(db: Session = Depends(get_db)):
    items = []
    # Check active incident
    active_inc = db.query(BreakdownIncident).filter(BreakdownIncident.status != "resolved").first()
    if active_inc:
        items.append({
            "id": f"ACT-{active_inc.id}",
            "urgency": "critical",
            "title": f"Active Breakdown Incident: {active_inc.id}",
            "description": f"{active_inc.vehicle_id} stranded at {active_inc.location} with {active_inc.affected_passengers} passengers.",
            "module": "rippleops",
            "actionLabel": "Resolve Recovery",
            "actionPayload": {"incidentId": active_inc.id}
        })

    # Check pending proposal
    pending_prop = db.query(ConsolidationProposal).filter(
        ConsolidationProposal.status.in_(["draft", "under_review", "passenger_consent_active"])
    ).first()
    if pending_prop:
        items.append({
            "id": f"ACT-{pending_prop.id}",
            "urgency": "high",
            "title": f"Consolidation Opportunity: {pending_prop.id}",
            "description": f"TRIP-201 and TRIP-202 ready for consolidation. Potential gross savings: ₹{pending_prop.financials.get('grossOperatingSavings', 16300)}.",
            "module": "tripmerge",
            "actionLabel": "Review Terms",
            "actionPayload": {"proposalId": pending_prop.id}
        })

    return items
