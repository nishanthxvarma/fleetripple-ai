from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime
from app.database import Base

class Operator(Base):
    __tablename__ = "operators"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    code = Column(String, nullable=False)
    contact = Column(String, nullable=False)
    rating = Column(Float, default=4.5)
    fleet_size = Column(Integer, default=10)
    status = Column(String, default="active")
    created_at = Column(DateTime, default=datetime.utcnow)
