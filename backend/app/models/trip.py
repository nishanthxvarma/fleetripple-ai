import json
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, ForeignKey, DateTime, Text
from app.database import Base

class Trip(Base):
    __tablename__ = "trips"

    id = Column(String, primary_key=True, index=True)
    operator_id = Column(String, ForeignKey("operators.id"), nullable=False, index=True)
    operator_name = Column(String, nullable=False)
    vehicle_id = Column(String, ForeignKey("vehicles.id"), nullable=False, index=True)
    route_name = Column(String, nullable=False)
    origin = Column(String, nullable=False)
    destination = Column(String, nullable=False)
    stops_json = Column(Text, default="[]")
    departure_time = Column(String, nullable=False)
    arrival_time = Column(String, nullable=False)
    status = Column(String, default="Scheduled")
    scheduled_capacity = Column(Integer, default=40)
    confirmed_bookings = Column(Integer, default=0)
    occupancy_percent = Column(Float, default=0.0)
    est_operating_cost = Column(Float, default=0.0)
    route_corridor = Column(String, default="NH-16 Coastal Corridor")
    created_at = Column(DateTime, default=datetime.utcnow)

    @property
    def stops(self):
        try:
            return json.loads(self.stops_json) if self.stops_json else []
        except Exception:
            return []

    @stops.setter
    def stops(self, value):
        self.stops_json = json.dumps(value)
