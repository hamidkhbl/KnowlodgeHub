from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from models.article import Article, ArticleStatus
from models.comment import ArticleComment
from models.like import CommentLike
from models.user import User, UserRole
from schemas.comment import CreateCommentRequest


def _inject_comment_like_data(comments: list[ArticleComment], current_user: User, db: Session) -> None:
    if not comments:
        return
    ids = [c.id for c in comments]
    counts = dict(
        db.query(CommentLike.comment_id, func.count(CommentLike.id))
        .filter(CommentLike.comment_id.in_(ids))
        .group_by(CommentLike.comment_id)
        .all()
    )
    liked_ids = {
        row.comment_id
        for row in db.query(CommentLike.comment_id)
        .filter(CommentLike.comment_id.in_(ids), CommentLike.user_id == current_user.id)
        .all()
    }
    for comment in comments:
        comment.__dict__["like_count"] = counts.get(comment.id, 0)
        comment.__dict__["liked_by_current_user"] = comment.id in liked_ids


def _get_published_article_in_org(article_id: int, organization_id: int, db: Session) -> Article:
    article = (
        db.query(Article)
        .filter(
            Article.id == article_id,
            Article.organization_id == organization_id,
            Article.status == ArticleStatus.PUBLISHED,
        )
        .first()
    )
    if not article:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found")
    return article


def get_comments(article_id: int, current_user: User, db: Session) -> list[ArticleComment]:
    _get_published_article_in_org(article_id, current_user.organization_id, db)

    comments = (
        db.query(ArticleComment)
        .filter(
            ArticleComment.article_id == article_id,
            ArticleComment.organization_id == current_user.organization_id,
        )
        .order_by(ArticleComment.created_at.asc())
        .all()
    )
    _inject_comment_like_data(comments, current_user, db)
    return comments


def create_comment(
    article_id: int,
    request: CreateCommentRequest,
    current_user: User,
    db: Session,
) -> ArticleComment:
    if not request.body.strip():
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Comment body cannot be empty")

    _get_published_article_in_org(article_id, current_user.organization_id, db)

    comment = ArticleComment(
        organization_id=current_user.organization_id,
        article_id=article_id,
        author_id=current_user.id,
        body=request.body.strip(),
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    _inject_comment_like_data([comment], current_user, db)
    return comment


def delete_comment(
    article_id: int,
    comment_id: int,
    current_user: User,
    db: Session,
) -> None:
    _get_published_article_in_org(article_id, current_user.organization_id, db)

    comment = (
        db.query(ArticleComment)
        .filter(
            ArticleComment.id == comment_id,
            ArticleComment.article_id == article_id,
            ArticleComment.organization_id == current_user.organization_id,
        )
        .first()
    )
    if not comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")

    is_privileged = current_user.role in (UserRole.ORG_ADMIN, UserRole.MANAGER)
    if not is_privileged and comment.author_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only delete your own comments")

    db.delete(comment)
    db.commit()
