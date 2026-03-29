from typing import Optional

from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from models.department import Department
from models.user import User
from models.article import Article
from schemas.department import CreateDepartmentRequest, MoveDepartmentRequest

MAX_DEPTH = 10


def _compute_depth(department_id: int, db: Session) -> int:
    """Walk up the ancestor chain and return the depth of this department (root org = 0, top-level = 1)."""
    depth = 0
    current_id: Optional[int] = department_id
    visited: set[int] = set()
    while current_id is not None:
        if current_id in visited:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cycle detected in department hierarchy",
            )
        visited.add(current_id)
        dept = db.query(Department).filter(Department.id == current_id).first()
        if dept is None:
            break
        current_id = dept.parent_department_id
        depth += 1
    return depth


def _is_descendant(ancestor_id: int, candidate_id: int, db: Session) -> bool:
    """Return True if candidate_id is a descendant of ancestor_id."""
    current_id: Optional[int] = candidate_id
    visited: set[int] = set()
    while current_id is not None:
        if current_id in visited:
            return False
        visited.add(current_id)
        if current_id == ancestor_id:
            return True
        dept = db.query(Department).filter(Department.id == current_id).first()
        if dept is None:
            break
        current_id = dept.parent_department_id
    return False


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

    if request.parent_department_id is not None:
        parent = (
            db.query(Department)
            .filter(
                Department.id == request.parent_department_id,
                Department.organization_id == organization_id,
            )
            .first()
        )
        if parent is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Parent department not found",
            )

        parent_depth = _compute_depth(request.parent_department_id, db)
        if parent_depth >= MAX_DEPTH:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Maximum department hierarchy depth of {MAX_DEPTH} reached",
            )

    department = Department(
        organization_id=organization_id,
        parent_department_id=request.parent_department_id,
        name=request.name,
    )
    db.add(department)
    db.commit()
    db.refresh(department)
    return department


def delete_department(department_id: int, organization_id: int, db: Session) -> None:
    dept = (
        db.query(Department)
        .filter(Department.id == department_id, Department.organization_id == organization_id)
        .first()
    )
    if dept is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")

    has_children = (
        db.query(Department).filter(Department.parent_department_id == department_id).first()
    )
    if has_children:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete a department that has sub-departments",
        )

    has_users = db.query(User).filter(User.department_id == department_id).first()
    if has_users:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete a department that has assigned users",
        )

    has_articles = db.query(Article).filter(Article.department_id == department_id).first()
    if has_articles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete a department that has assigned articles",
        )

    db.delete(dept)
    db.commit()


def move_department(
    department_id: int,
    request: MoveDepartmentRequest,
    organization_id: int,
    db: Session,
) -> Department:
    dept = (
        db.query(Department)
        .filter(Department.id == department_id, Department.organization_id == organization_id)
        .first()
    )
    if dept is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")

    new_parent_id = request.new_parent_department_id

    if new_parent_id is not None:
        if new_parent_id == department_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A department cannot be its own parent",
            )

        new_parent = (
            db.query(Department)
            .filter(
                Department.id == new_parent_id,
                Department.organization_id == organization_id,
            )
            .first()
        )
        if new_parent is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Target parent department not found",
            )

        if _is_descendant(department_id, new_parent_id, db):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot move a department into one of its own sub-departments",
            )

        new_parent_depth = _compute_depth(new_parent_id, db)
        if new_parent_depth >= MAX_DEPTH:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Maximum department hierarchy depth of {MAX_DEPTH} reached",
            )

    dept.parent_department_id = new_parent_id
    db.commit()
    db.refresh(dept)
    return dept
