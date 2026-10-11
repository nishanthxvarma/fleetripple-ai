from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, DateTime
from app.database import Base

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(String, primary_key=True, index=True)
    reg_number = Column(String, nullable=False)
    operator_id = Column(String, ForeignKey("operators.id"), nullable=False, index=True)
    operator_name = Column(String, nullable=False)
    model = Column(String, nullable=False)
    route = Column(String, nullable=False)
    route_id = Column(String, nullable=False)
    capacity = Column(Integer, default=40)
    confirmed_bookings = Column(Integer, default=0)
    available_seats = Column(Integer, default=40)
    status = Column(String, default="Active")
    location = Column(String, nullable=False)
    direction = Column(String, nullable=False)
    current_trip_id = Column(String, nullable=True)
    is_available = Column(Boolean, default=True)
    departure_time = Column(String, nullable=True)
    arrival_time = Column(String, nullable=True)
    active_incident_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
