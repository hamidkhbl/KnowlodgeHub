from pydantic import BaseModel


class OrgResponse(BaseModel):
    id: int
    name: str
    slug: str
    logo: str | None

    model_config = {"from_attributes": True}


class UpdateLogoRequest(BaseModel):
    logo: str | None  # base64 data URL or null to remove
