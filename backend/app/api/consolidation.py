from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.consolidation import ConsolidationProposal
from app.schemas.consolidation import (
    OperatorNegotiateRequest,
    ProposalReviseRequest
)
from app.services.consolidation_service import ConsolidationService

router = APIRouter(prefix="/consolidation")

@router.get("/opportunities")
def get_opportunities(threshold: float = 50.0, db: Session = Depends(get_db)):
    return ConsolidationService.get_opportunities(db, threshold)

@router.get("/proposals")
def get_proposals(db: Session = Depends(get_db)):
    proposals = db.query(ConsolidationProposal).all()
    return [ConsolidationService.get_proposal_detail(db, p.id) for p in proposals]

@router.get("/proposals/{proposal_id}")
def get_proposal(proposal_id: str, db: Session = Depends(get_db)):
    return ConsolidationService.get_proposal_detail(db, proposal_id)

@router.post("/proposals/{proposal_id}/respond")
def respond_operator_negotiation(proposal_id: str, payload: OperatorNegotiateRequest, db: Session = Depends(get_db)):
    return ConsolidationService.negotiate_operator(
        db=db,
        proposal_id=proposal_id,
        operator_id=payload.operator_id,
        decision=payload.decision,
        notes=payload.notes
    )

@router.post("/proposals/{proposal_id}/revise")
def revise_terms(proposal_id: str, payload: ProposalReviseRequest, db: Session = Depends(get_db)):
    return ConsolidationService.revise_proposal_terms(
        db=db,
        proposal_id=proposal_id,
        new_transfer_payment=payload.transfer_payment
    )

@router.post("/proposals/{proposal_id}/send-offers")
def send_offers(proposal_id: str, db: Session = Depends(get_db)):
    return ConsolidationService.send_consolidation_offers(db, proposal_id)

@router.post("/proposals/{proposal_id}/finalize")
def finalize(proposal_id: str, db: Session = Depends(get_db)):
    return ConsolidationService.finalize_consolidation(db, proposal_id)

@router.post("/proposals/{proposal_id}/cancel")
def cancel(proposal_id: str, reason: str = "Operator commercial deadlock", db: Session = Depends(get_db)):
    return ConsolidationService.cancel_proposal(db, proposal_id, reason)
