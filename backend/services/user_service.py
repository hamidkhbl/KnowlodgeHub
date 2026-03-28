from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from core.security import hash_password
from models.user import User
from schemas.user import CreateUserRequest


def get_users(organization_id: int, db: Session) -> list[User]:
    return db.query(User).filter(User.organization_id == organization_id).all()


def create_user(request: CreateUserRequest, organization_id: int, db: Session) -> User:
    if db.query(User).filter(User.email == request.email).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already exists",
        )

    user = User(
        organization_id=organization_id,
        department_id=request.department_id,
        name=request.name,
        email=request.email,
        password_hash=hash_password(request.password),
        role=request.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
