from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.vehicle import Vehicle
from app.schemas.vehicle import VehicleStatusUpdate

router = APIRouter(prefix="/vehicles")

def serialize_vehicle(v: Vehicle):
    return {
        "id": v.id,
        "regNumber": v.reg_number,
        "operatorId": v.operator_id,
        "operatorName": v.operator_name,
        "model": v.model,
        "route": v.route,
        "routeId": v.route_id,
        "capacity": v.capacity,
        "confirmedBookings": v.confirmed_bookings,
        "availableSeats": v.available_seats,
        "status": v.status,
        "location": v.location,
        "direction": v.direction,
        "currentTripId": v.current_trip_id,
        "isAvailable": v.is_available,
        "departureTime": v.departure_time,
        "arrivalTime": v.arrival_time,
        "activeIncidentId": v.active_incident_id
    }

@router.get("")
def get_vehicles(db: Session = Depends(get_db)):
    vehicles = db.query(Vehicle).all()
    return [serialize_vehicle(v) for v in vehicles]

@router.get("/{vehicle_id}")
def get_vehicle(vehicle_id: str, db: Session = Depends(get_db)):
    v = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not v:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")
    return serialize_vehicle(v)

@router.patch("/{vehicle_id}/status")
def update_vehicle_status(vehicle_id: str, payload: VehicleStatusUpdate, db: Session = Depends(get_db)):
    v = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not v:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")
    v.status = payload.status
    if payload.is_available is not None:
        v.is_available = payload.is_available
    db.commit()
    db.refresh(v)
    return serialize_vehicle(v)
