from typing import Optional

from pydantic import BaseModel, EmailStr

from models.user import UserRole


class CreateUserRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole
    department_id: Optional[int] = None


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: UserRole
    department_id: Optional[int]
    organization_id: int

    model_config = {"from_attributes": True}
