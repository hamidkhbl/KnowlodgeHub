from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.database import get_db
from core.dependencies import require_authenticated, require_org_admin
from models.user import User
from schemas.organization import OrgResponse, UpdateLogoRequest

router = APIRouter(prefix="/organizations", tags=["organizations"])


@router.get("/me", response_model=OrgResponse)
def get_my_organization(
    current_user: User = Depends(require_authenticated),
    db: Session = Depends(get_db),
):
    return current_user.organization


@router.put("/me/logo", response_model=OrgResponse)
def update_logo(
    request: UpdateLogoRequest,
    current_user: User = Depends(require_org_admin),
    db: Session = Depends(get_db),
):
    org = current_user.organization
    org.logo = request.logo
    db.commit()
    db.refresh(org)
    return org
