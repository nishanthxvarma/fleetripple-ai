from datetime import datetime
from sqlalchemy import Column, String, Float, ForeignKey, DateTime
from app.database import Base

class RefundRequest(Base):
    __tablename__ = "refund_requests"

    id = Column(String, primary_key=True, index=True)
    booking_id = Column(String, ForeignKey("bookings.id"), nullable=False, index=True)
    reason = Column(String, nullable=False)
    amount = Column(Float, default=0.0)
    status = Column(String, default="recorded_pending_settlement")  # 'recorded_pending_settlement' | 'processed'
    created_at = Column(DateTime, default=datetime.utcnow)
