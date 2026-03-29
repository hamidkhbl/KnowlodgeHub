from typing import Optional

from pydantic import BaseModel


class CreateDepartmentRequest(BaseModel):
    name: str
    parent_department_id: Optional[int] = None


class MoveDepartmentRequest(BaseModel):
    new_parent_department_id: Optional[int] = None


class DepartmentResponse(BaseModel):
    id: int
    name: str
    organization_id: int
    parent_department_id: Optional[int] = None

    model_config = {"from_attributes": True}
