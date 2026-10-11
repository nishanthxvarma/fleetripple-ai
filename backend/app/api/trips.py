from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.trip import Trip

router = APIRouter(prefix="/trips")

def serialize_trip(t: Trip):
    return {
        "id": t.id,
        "operatorId": t.operator_id,
        "operatorName": t.operator_name,
        "busId": t.vehicle_id,
        "vehicle_id": t.vehicle_id,
        "route": t.route_name,
        "origin": t.origin,
        "destination": t.destination,
        "stops": t.stops,
        "departureTime": t.departure_time,
        "arrivalTime": t.arrival_time,
        "status": t.status,
        "capacity": t.scheduled_capacity,
        "confirmedBookings": t.confirmed_bookings,
        "occupancyPercent": t.occupancy_percent,
        "estOperatingCost": t.est_operating_cost,
        "estCost": t.est_operating_cost,
        "est_operating_cost": t.est_operating_cost,
        "corridor": t.route_corridor
    }

@router.get("")
def get_trips(db: Session = Depends(get_db)):
    trips = db.query(Trip).all()
    return [serialize_trip(t) for t in trips]

@router.get("/{trip_id}")
def get_trip(trip_id: str, db: Session = Depends(get_db)):
    t = db.query(Trip).filter(Trip.id == trip_id).first()
    if not t:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")
    return serialize_trip(t)
