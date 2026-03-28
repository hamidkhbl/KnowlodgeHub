from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from models.organization import Organization
from models.user import User, UserRole
from core.security import hash_password, verify_password, create_access_token
from schemas.auth import RegisterOrganizationRequest, LoginRequest


def register_organization(request: RegisterOrganizationRequest, db: Session) -> dict:
    if db.query(Organization).filter(Organization.slug == request.organization_slug).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Organization slug already exists",
        )

    if db.query(User).filter(User.email == request.admin_email).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already exists",
        )

    organization = Organization(
        name=request.organization_name,
        slug=request.organization_slug,
    )
    db.add(organization)
    db.flush()  # get organization.id before committing

    user = User(
        organization_id=organization.id,
        name=request.admin_name,
        email=request.admin_email,
        password_hash=hash_password(request.password),
        role=UserRole.ORG_ADMIN,
    )
    db.add(user)
    db.commit()
    db.refresh(organization)
    db.refresh(user)

    access_token = create_access_token(user.id)

    return {
        "message": "Organization created successfully",
        "organization": organization,
        "user": user,
        "access_token": access_token,
        "token_type": "bearer",
    }


def login(request: LoginRequest, db: Session) -> dict:
    user = db.query(User).filter(User.email == request.email).first()

    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    access_token = create_access_token(user.id)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }
