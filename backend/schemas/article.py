from typing import Optional

from pydantic import BaseModel

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
    organization_id: int

    model_config = {"from_attributes": True}


class DeleteArticleResponse(BaseModel):
    message: str
