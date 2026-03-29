from datetime import datetime
from typing import Optional

from pydantic import BaseModel, model_validator

from models.article import ArticleStatus


class CreateArticleRequest(BaseModel):
    title: str
    content: str
    status: ArticleStatus
    tags: Optional[str] = None
    department_id: Optional[int] = None


class UpdateArticleRequest(BaseModel):
    title: str
    content: str
    status: ArticleStatus
    tags: Optional[str] = None
    department_id: Optional[int] = None


class ArticleResponse(BaseModel):
    id: int
    title: str
    content: str
    tags: Optional[str]
    status: ArticleStatus
    department_id: Optional[int]
    author_id: int
    author_name: str
    organization_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

    @model_validator(mode='before')
    @classmethod
    def populate_author_name(cls, obj):
        if hasattr(obj, 'author') and obj.author is not None:
            obj.__dict__['author_name'] = obj.author.name
        return obj


class DeleteArticleResponse(BaseModel):
    message: str
