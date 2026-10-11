from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.passenger_offer import PassengerOffer
from app.models.booking import Booking
from app.services.recovery_service import RecoveryService
from app.services.consolidation_service import ConsolidationService
from app.services.audit_service import log_audit_event

router = APIRouter()

class OfferRespondPayload(BaseModel):
    decision: str  # 'accept' | 'wait' | 'refund'
    reason: Optional[str] = None

class BookingRespondPayload(BaseModel):
    booking_id: str
    decision: str
    reason: Optional[str] = None

class SimulateRecoveryPayload(BaseModel):
    scenario: str  # 'all_accept' | 'mixed_realistic' | 'mostly_refund'

class SimulateConsolidationPayload(BaseModel):
    scenario: str  # 'all_accept' | 'high_accept_90' | 'low_accept_50_infeasible'

@router.get("/passenger/offers")
def get_passenger_offers(db: Session = Depends(get_db)):
    offers = db.query(PassengerOffer).all()
    return [
        {
            "id": o.id,
            "bookingId": o.booking_id,
            "offerType": o.offer_type,
            "referenceId": o.reference_id,
            "replacementVehicleId": o.replacement_vehicle_id,
            "replacementTripId": o.replacement_trip_id,
            "status": o.status,
            "responseTimestamp": o.response_timestamp
        }
        for o in offers
    ]

@router.post("/offers/{offer_id}/respond")
def respond_offer(offer_id: str, payload: OfferRespondPayload, db: Session = Depends(get_db)):
    offer = db.query(PassengerOffer).filter(PassengerOffer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Offer not found")

    if offer.offer_type == "recovery":
        return RecoveryService.respond_to_offer(db, offer.booking_id, payload.decision, payload.reason)
    else:
        return ConsolidationService.respond_to_consolidation_offer(db, offer.booking_id, payload.decision)

@router.post("/passenger/respond-recovery")
def respond_recovery(payload: BookingRespondPayload, db: Session = Depends(get_db)):
    return RecoveryService.respond_to_offer(db, payload.booking_id, payload.decision, payload.reason)

@router.post("/passenger/respond-consolidation")
def respond_consolidation(payload: BookingRespondPayload, db: Session = Depends(get_db)):
    return ConsolidationService.respond_to_consolidation_offer(db, payload.booking_id, payload.decision)

@router.post("/passenger/simulate-recovery")
def simulate_recovery_batch(payload: SimulateRecoveryPayload, db: Session = Depends(get_db)):
    # Batch responses on TRIP-101
    bookings = db.query(Booking).filter(Booking.trip_id == "TRIP-101").all()
    scenario = payload.scenario

    for b in bookings:
        if scenario == "all_accept":
            RecoveryService.respond_to_offer(db, b.id, "accept")
        elif scenario == "mixed_realistic":
            if b.id == "BKG-101-03":
                RecoveryService.respond_to_offer(db, b.id, "wait")
            elif b.id == "BKG-101-09":
                RecoveryService.respond_to_offer(db, b.id, "refund")
            else:
                RecoveryService.respond_to_offer(db, b.id, "accept")
        elif scenario == "mostly_refund":
            if b.passenger_count == 1:
                RecoveryService.respond_to_offer(db, b.id, "refund")
            else:
                RecoveryService.respond_to_offer(db, b.id, "accept")

    log_audit_event(
        db,
        event_type="SIMULATION",
        actor="Interactive Scenario Helper",
        description=f"Batch passenger response simulation applied: {scenario}.",
        badge_color="indigo"
    )

    return {"success": True, "scenario": scenario, "affected_bookings": len(bookings)}

@router.post("/passenger/simulate-consolidation")
def simulate_consolidation_batch(payload: SimulateConsolidationPayload, db: Session = Depends(get_db)):
    bookings = db.query(Booking).filter(Booking.trip_id.in_(["TRIP-201", "TRIP-202"])).all()
    scenario = payload.scenario

    for b in bookings:
        if scenario == "all_accept":
            ConsolidationService.respond_to_consolidation_offer(db, b.id, "accept")
        elif scenario == "high_accept_90":
            if b.id == "BKG-201-03":
                ConsolidationService.respond_to_consolidation_offer(db, b.id, "refund")
            else:
                ConsolidationService.respond_to_consolidation_offer(db, b.id, "accept")
        elif scenario == "low_accept_50_infeasible":
            if b.id in ["BKG-201-01", "BKG-201-02", "BKG-201-04", "BKG-202-01", "BKG-202-02"]:
                ConsolidationService.respond_to_consolidation_offer(db, b.id, "refund")
            else:
                ConsolidationService.respond_to_consolidation_offer(db, b.id, "accept")

    log_audit_event(
        db,
        event_type="SIMULATION",
        actor="Demo Batch Runner",
        description=f"Batch consolidation responses applied: {scenario}.",
        badge_color="indigo"
    )

    return {"success": True, "scenario": scenario, "affected_bookings": len(bookings)}
