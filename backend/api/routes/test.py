from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.database import get_db
from services import test_service

router = APIRouter(prefix="/test", tags=["test"])


@router.post("/reset")
def reset():
    test_service.reset_database()
    return {"message": "Database reset successfully"}


@router.post("/seed")
def seed(db: Session = Depends(get_db)):
    test_service.seed_database(db)
    return {"message": "Demo data seeded successfully"}
