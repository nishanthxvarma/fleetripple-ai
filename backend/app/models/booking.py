import json
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, ForeignKey, DateTime, Text
from app.database import Base

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(String, primary_key=True, index=True)
    trip_id = Column(String, ForeignKey("trips.id"), nullable=False, index=True)
    lead_passenger = Column(String, nullable=False)
    passenger_count = Column(Integer, default=1)
    phone = Column(String, nullable=False)
    seat_numbers_json = Column(Text, default="[]")
    boarding_point = Column(String, nullable=False)
    destination = Column(String, nullable=False)
    fare = Column(Float, default=0.0)
    status = Column(String, default="confirmed")
    # 'confirmed' | 'unassigned' | 'offered' | 'accepted' | 'waiting_alternative' | 'refund_requested' | 'consolidation_offered' | 'consolidation_accepted' | 'consolidation_refund_requested' | 'boarded'
    assigned_vehicle_id = Column(String, nullable=True)
    group_reference = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    @property
    def seat_numbers(self):
        try:
            return json.loads(self.seat_numbers_json) if self.seat_numbers_json else []
        except Exception:
            return []

    @seat_numbers.setter
    def seat_numbers(self, value):
        self.seat_numbers_json = json.dumps(value)
