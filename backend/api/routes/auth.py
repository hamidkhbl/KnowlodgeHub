from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.database import get_db
from core.dependencies import get_current_user
from models.user import User
from schemas.auth import (
    RegisterOrganizationRequest,
    RegisterOrganizationResponse,
    LoginRequest,
    LoginResponse,
    CurrentUserOut,
)
from services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register-organization", response_model=RegisterOrganizationResponse, status_code=201)
def register_organization(
    request: RegisterOrganizationRequest,
    db: Session = Depends(get_db),
):
    return auth_service.register_organization(request, db)


@router.post("/login", response_model=LoginResponse)
def login(
    request: LoginRequest,
    db: Session = Depends(get_db),
):
    return auth_service.login(request, db)


@router.get("/me", response_model=CurrentUserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
