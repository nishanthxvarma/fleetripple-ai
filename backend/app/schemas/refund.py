from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class RefundRequestCreate(BaseModel):
    booking_id: str
    reason: str
    amount: float

class RefundRequestResponse(BaseModel):
    id: str
    booking_id: str
    reason: str
    amount: float
    status: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
