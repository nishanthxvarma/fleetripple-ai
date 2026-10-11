from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AuditEventCreate(BaseModel):
    event_type: str
    actor: str
    description: str
    badge_color: Optional[str] = "blue"
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None

class AuditEventResponse(BaseModel):
    id: str
    timestamp: str
    event_type: str
    actor: str
    description: str
    badge_color: str
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
