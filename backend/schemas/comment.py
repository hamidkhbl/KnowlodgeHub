from datetime import datetime

from pydantic import BaseModel, model_validator


class CreateCommentRequest(BaseModel):
    body: str


class CommentResponse(BaseModel):
    id: int
    article_id: int
    author_id: int
    author_name: str
    body: str
    created_at: datetime
    like_count: int = 0
    liked_by_current_user: bool = False

    model_config = {"from_attributes": True}

    @model_validator(mode="before")
    @classmethod
    def populate_author_name(cls, obj):
        if hasattr(obj, "author") and obj.author is not None:
            obj.__dict__["author_name"] = obj.author.name
        return obj
