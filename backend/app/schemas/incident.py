from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class IncidentCreate(BaseModel):
    vehicle_id: str
    trip_id: str
    stage: str  # "En Route" | "Before Departure"
    location: str
    affected_passengers: Optional[int] = None
    description: Optional[str] = "Vehicle mechanical failure reported by operator."

class IncidentResponse(BaseModel):
    id: str
    trip_id: str
    vehicle_id: str
    route: str
    stage: str
    location: str
    reported_time: str
    affected_passengers: int
    description: str
    status: str
    resolution_summary: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class IncidentResolveRequest(BaseModel):
    resolution_summary: Optional[str] = "Incident resolved and archived."
