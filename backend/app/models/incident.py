from datetime import datetime
from sqlalchemy import Column, String, Integer, ForeignKey, DateTime
from app.database import Base

class BreakdownIncident(Base):
    __tablename__ = "breakdown_incidents"

    id = Column(String, primary_key=True, index=True)
    trip_id = Column(String, ForeignKey("trips.id"), nullable=False, index=True)
    vehicle_id = Column(String, ForeignKey("vehicles.id"), nullable=False, index=True)
    route = Column(String, nullable=False)
    stage = Column(String, nullable=False)  # "En Route" | "Before Departure"
    location = Column(String, nullable=False)
    reported_time = Column(String, nullable=False)
    affected_passengers = Column(Integer, default=0)
    description = Column(String, nullable=False)
    status = Column(String, default="reported")
    # 'reported' | 'recovery_planned' | 'plan_approved' | 'offers_sent' | 'reconciled' | 'resolved'
    resolution_summary = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
