from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.database import get_db
from core.dependencies import require_authenticated
from models.article import ArticleStatus
from models.user import User
from schemas.article import (
    ArticleResponse,
    CreateArticleRequest,
    DeleteArticleResponse,
    UpdateArticleRequest,
)
from services import article_service

router = APIRouter(prefix="/articles", tags=["articles"])


@router.get("", response_model=list[ArticleResponse])
def get_articles(
    q: Optional[str] = None,
    status: Optional[ArticleStatus] = None,
    department_id: Optional[int] = None,
    current_user: User = Depends(require_authenticated),
    db: Session = Depends(get_db),
):
    return article_service.get_articles(current_user, db, q, status, department_id)


@router.get("/{article_id}", response_model=ArticleResponse)
def get_article(
    article_id: int,
    current_user: User = Depends(require_authenticated),
    db: Session = Depends(get_db),
):
    return article_service.get_article(article_id, current_user, db)


@router.post("", response_model=ArticleResponse, status_code=201)
def create_article(
    request: CreateArticleRequest,
    current_user: User = Depends(require_authenticated),
    db: Session = Depends(get_db),
):
    return article_service.create_article(request, current_user, db)


@router.put("/{article_id}", response_model=ArticleResponse)
def update_article(
    article_id: int,
    request: UpdateArticleRequest,
    current_user: User = Depends(require_authenticated),
    db: Session = Depends(get_db),
):
    return article_service.update_article(article_id, request, current_user, db)


@router.delete("/{article_id}", response_model=DeleteArticleResponse)
def delete_article(
    article_id: int,
    current_user: User = Depends(require_authenticated),
    db: Session = Depends(get_db),
):
    article_service.delete_article(article_id, current_user, db)
    return {"message": "Article deleted successfully"}
