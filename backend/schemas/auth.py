from typing import Annotated

from pydantic import BaseModel, EmailStr, Field

from models.user import UserRole


# --- Request schemas ---

class RegisterOrganizationRequest(BaseModel):
    organization_name: Annotated[str, Field(validation_alias="organizationName")]
    organization_slug: Annotated[str, Field(validation_alias="organizationSlug")]
    admin_name: Annotated[str, Field(validation_alias="adminName")]
    admin_email: Annotated[EmailStr, Field(validation_alias="adminEmail")]
    password: str

    model_config = {"populate_by_name": True}


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# --- Response sub-schemas ---

class OrganizationOut(BaseModel):
    id: int
    name: str
    slug: str

    model_config = {"from_attributes": True}


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: UserRole

    model_config = {"from_attributes": True}


class CurrentUserOut(BaseModel):
    id: int
    name: str
    email: str
    role: UserRole
    organization_id: int
    department_id: int | None

    model_config = {"from_attributes": True}


# --- Top-level response schemas ---

class RegisterOrganizationResponse(BaseModel):
    message: str
    organization: OrganizationOut
    user: UserOut
    access_token: str
    token_type: str = "bearer"


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: CurrentUserOut
