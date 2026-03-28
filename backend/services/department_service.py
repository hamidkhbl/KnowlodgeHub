from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from models.department import Department
from schemas.department import CreateDepartmentRequest


def get_departments(organization_id: int, db: Session) -> list[Department]:
    return db.query(Department).filter(Department.organization_id == organization_id).all()


def create_department(request: CreateDepartmentRequest, organization_id: int, db: Session) -> Department:
    existing = (
        db.query(Department)
        .filter(Department.organization_id == organization_id, Department.name == request.name)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Department name already exists in this organization",
        )

    department = Department(
        organization_id=organization_id,
        name=request.name,
    )
    db.add(department)
    db.commit()
    db.refresh(department)
    return department
