from datetime import datetime
from sqlalchemy import Column, String, ForeignKey, DateTime
from app.database import Base

class PassengerOffer(Base):
    __tablename__ = "passenger_offers"

    id = Column(String, primary_key=True, index=True)
    booking_id = Column(String, ForeignKey("bookings.id"), nullable=False, index=True)
    offer_type = Column(String, nullable=False)  # 'recovery' | 'consolidation'
    reference_id = Column(String, nullable=False, index=True)  # incident_id or proposal_id
    replacement_vehicle_id = Column(String, nullable=True)
    replacement_trip_id = Column(String, nullable=True)
    status = Column(String, default="sent")  # 'sent' | 'accepted' | 'waiting' | 'refund_requested' | 'expired'
    response_timestamp = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
