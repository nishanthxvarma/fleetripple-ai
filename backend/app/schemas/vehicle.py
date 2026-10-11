from pydantic import BaseModel
from typing import Optional

class VehicleBase(BaseModel):
    id: str
    reg_number: str
    operator_id: str
    operator_name: str
    model: str
    route: str
    route_id: str
    capacity: int = 40
    confirmed_bookings: int = 0
    available_seats: int = 40
    status: str = "Active"
    location: str
    direction: str
    current_trip_id: Optional[str] = None
    is_available: bool = True
    departure_time: Optional[str] = None
    arrival_time: Optional[str] = None
    active_incident_id: Optional[str] = None

class VehicleStatusUpdate(BaseModel):
    status: str
    is_available: Optional[bool] = None

class VehicleResponse(VehicleBase):
    class Config:
        from_attributes = True
