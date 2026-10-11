from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.seed.seed_data import seed_database

router = APIRouter(prefix="/demo")

@router.post("/reset")
def reset_demo_database(db: Session = Depends(get_db)):
    seed_database(db, force=True)
    return {
        "success": True,
        "message": "Demonstration database successfully reset to pristine seed state."
    }
