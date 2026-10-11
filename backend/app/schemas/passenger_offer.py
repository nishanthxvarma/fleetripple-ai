from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PassengerOfferResponse(BaseModel):
    id: str
    booking_id: str
    offer_type: str
    reference_id: str
    replacement_vehicle_id: Optional[str] = None
    replacement_trip_id: Optional[str] = None
    status: str
    response_timestamp: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class OfferRespondRequest(BaseModel):
    decision: str  # 'accept' | 'wait' | 'refund'
    reason: Optional[str] = None
