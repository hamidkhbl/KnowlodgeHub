from typing import Annotated

from pydantic import BaseModel, EmailStr, Field, model_validator

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
    organization_name: str
    department_id: int | None

    model_config = {"from_attributes": True}

    @model_validator(mode="before")
    @classmethod
    def populate_organization_name(cls, obj):
        if hasattr(obj, "organization") and obj.organization is not None:
            obj.__dict__["organization_name"] = obj.organization.name
        return obj


# --- Top-level response schemas ---

class RegisterOrganizationResponse(BaseModel):
    message: str
    organization: OrganizationOut
    user: CurrentUserOut
    access_token: str
    token_type: str = "bearer"


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: CurrentUserOut
