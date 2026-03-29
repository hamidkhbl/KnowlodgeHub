from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.database import get_db
from core.dependencies import require_authenticated
from models.user import User
from schemas.like import LikeSummary
from services import like_service

router = APIRouter(tags=["likes"])


@router.post("/articles/{article_id}/like", response_model=LikeSummary)
def like_article(
    article_id: int,
    current_user: User = Depends(require_authenticated),
    db: Session = Depends(get_db),
):
    return like_service.like_article(article_id, current_user, db)


@router.delete("/articles/{article_id}/like", response_model=LikeSummary)
def unlike_article(
    article_id: int,
    current_user: User = Depends(require_authenticated),
    db: Session = Depends(get_db),
):
    return like_service.unlike_article(article_id, current_user, db)


@router.post("/comments/{comment_id}/like", response_model=LikeSummary)
def like_comment(
    comment_id: int,
    current_user: User = Depends(require_authenticated),
    db: Session = Depends(get_db),
):
    return like_service.like_comment(comment_id, current_user, db)


@router.delete("/comments/{comment_id}/like", response_model=LikeSummary)
def unlike_comment(
    comment_id: int,
    current_user: User = Depends(require_authenticated),
    db: Session = Depends(get_db),
):
    return like_service.unlike_comment(comment_id, current_user, db)
