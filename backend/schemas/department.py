from pydantic import BaseModel


class CreateDepartmentRequest(BaseModel):
    name: str


class DepartmentResponse(BaseModel):
    id: int
    name: str
    organization_id: int

    model_config = {"from_attributes": True}
