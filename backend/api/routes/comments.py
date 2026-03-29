from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from core.database import get_db
from core.dependencies import require_authenticated
from models.user import User
from schemas.comment import CommentResponse, CreateCommentRequest
from services import comment_service

router = APIRouter(prefix="/articles/{article_id}/comments", tags=["comments"])


@router.get("", response_model=list[CommentResponse])
def get_comments(
    article_id: int,
    current_user: User = Depends(require_authenticated),
    db: Session = Depends(get_db),
):
    return comment_service.get_comments(article_id, current_user, db)


@router.post("", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def create_comment(
    article_id: int,
    request: CreateCommentRequest,
    current_user: User = Depends(require_authenticated),
    db: Session = Depends(get_db),
):
    return comment_service.create_comment(article_id, request, current_user, db)


@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    article_id: int,
    comment_id: int,
    current_user: User = Depends(require_authenticated),
    db: Session = Depends(get_db),
):
    comment_service.delete_comment(article_id, comment_id, current_user, db)
