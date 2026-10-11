from datetime import datetime
from sqlalchemy import Column, String, Integer, ForeignKey, DateTime
from app.database import Base

class OperatorAgreement(Base):
    __tablename__ = "operator_agreements"

    id = Column(String, primary_key=True, index=True)
    proposal_id = Column(String, ForeignKey("consolidation_proposals.id"), nullable=False, index=True)
    operator_id = Column(String, ForeignKey("operators.id"), nullable=False, index=True)
    proposal_version = Column(Integer, default=1)
    status = Column(String, default="pending")  # 'pending' | 'accepted' | 'rejected' | 'revision_requested'
    notes = Column(String, nullable=True)
    responded_at = Column(DateTime, nullable=True)
