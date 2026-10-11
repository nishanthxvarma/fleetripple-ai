from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class BookingBase(BaseModel):
    id: str
    trip_id: str
    lead_passenger: str
    passenger_count: int = 1
    phone: str
    seat_numbers: List[str] = []
    boarding_point: str
    destination: str
    fare: float = 0.0
    status: str = "confirmed"
    assigned_vehicle_id: Optional[str] = None
    group_reference: Optional[str] = None

class BookingResponse(BookingBase):
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class BookingStatusUpdate(BaseModel):
    status: str
    assigned_vehicle_id: Optional[str] = None
