from pydantic import BaseModel
from typing import Optional

class OperatorBase(BaseModel):
    id: str
    name: str
    code: str
    contact: str
    rating: float = 4.5
    fleet_size: int = 10
    status: str = "active"

class OperatorResponse(OperatorBase):
    class Config:
        from_attributes = True
