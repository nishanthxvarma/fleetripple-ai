from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.operator import Operator

router = APIRouter(prefix="/operators")

@router.get("")
def get_operators(db: Session = Depends(get_db)):
    operators = db.query(Operator).all()
    return [
        {
            "id": op.id,
            "name": op.name,
            "code": op.code,
            "contact": op.contact,
            "rating": op.rating,
            "fleetSize": op.fleet_size,
            "status": op.status
        }
        for op in operators
    ]
