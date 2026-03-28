from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.database import get_db
from core.dependencies import require_authenticated, require_org_admin
from models.user import User
from schemas.department import CreateDepartmentRequest, DepartmentResponse
from services import department_service

router = APIRouter(prefix="/departments", tags=["departments"])


@router.get("", response_model=list[DepartmentResponse])
def get_departments(
    current_user: User = Depends(require_authenticated),
    db: Session = Depends(get_db),
):
    return department_service.get_departments(current_user.organization_id, db)


@router.post("", response_model=DepartmentResponse, status_code=201)
def create_department(
    request: CreateDepartmentRequest,
    current_user: User = Depends(require_org_admin),
    db: Session = Depends(get_db),
):
    return department_service.create_department(request, current_user.organization_id, db)
