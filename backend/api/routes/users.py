from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.database import get_db
from core.dependencies import require_org_admin
from models.user import User
from schemas.user import CreateUserRequest, UserResponse
from services import user_service

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[UserResponse])
def get_users(
    current_user: User = Depends(require_org_admin),
    db: Session = Depends(get_db),
):
    return user_service.get_users(current_user.organization_id, db)


@router.post("", response_model=UserResponse, status_code=201)
def create_user(
    request: CreateUserRequest,
    current_user: User = Depends(require_org_admin),
    db: Session = Depends(get_db),
):
    return user_service.create_user(request, current_user.organization_id, db)
