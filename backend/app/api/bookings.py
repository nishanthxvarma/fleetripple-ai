from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.booking import Booking

router = APIRouter(prefix="/bookings")

def serialize_booking(b: Booking):
    return {
        "id": b.id,
        "tripId": b.trip_id,
        "leadPassenger": b.lead_passenger,
        "passengerCount": b.passenger_count,
        "phone": b.phone,
        "seatNumbers": b.seat_numbers,
        "boardingPoint": b.boarding_point,
        "destination": b.destination,
        "fare": b.fare,
        "status": b.status,
        "assignedBusId": b.assigned_vehicle_id,
        "groupReference": b.group_reference
    }

@router.get("")
def get_bookings(trip_id: str = None, db: Session = Depends(get_db)):
    query = db.query(Booking)
    if trip_id:
        query = query.filter(Booking.trip_id == trip_id)
    bookings = query.all()
    return [serialize_booking(b) for b in bookings]

@router.get("/{booking_id}")
def get_booking(booking_id: str, db: Session = Depends(get_db)):
    b = db.query(Booking).filter(Booking.id == booking_id).first()
    if not b:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    return serialize_booking(b)
