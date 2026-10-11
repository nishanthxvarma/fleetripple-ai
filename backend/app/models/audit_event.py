from datetime import datetime
from sqlalchemy import Column, String, DateTime
from app.database import Base

class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(String, primary_key=True, index=True)
    timestamp = Column(String, nullable=False)
    event_type = Column(String, nullable=False)
    actor = Column(String, nullable=False)
    description = Column(String, nullable=False)
    badge_color = Column(String, default="blue")
    entity_type = Column(String, nullable=True)
    entity_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
