from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.refund_request import RefundRequest

router = APIRouter(prefix="/refunds")

@router.get("")
def get_refunds(db: Session = Depends(get_db)):
    refunds = db.query(RefundRequest).order_by(RefundRequest.created_at.desc()).all()
    return [
        {
            "id": r.id,
            "bookingId": r.booking_id,
            "reason": r.reason,
            "amount": r.amount,
            "status": r.status,
            "createdAt": r.created_at.strftime("%H:%M:%S IST") if r.created_at else None
        }
        for r in refunds
    ]
