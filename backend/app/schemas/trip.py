from pydantic import BaseModel
from typing import Optional, List

class TripBase(BaseModel):
    id: str
    operator_id: str
    operator_name: str
    vehicle_id: str
    route_name: str
    origin: str
    destination: str
    stops: List[str] = []
    departure_time: str
    arrival_time: str
    status: str = "Scheduled"
    scheduled_capacity: int = 40
    confirmed_bookings: int = 0
    occupancy_percent: float = 0.0
    est_operating_cost: float = 0.0
    route_corridor: str = "NH-16 Coastal Corridor"

class TripResponse(TripBase):
    class Config:
        from_attributes = True
