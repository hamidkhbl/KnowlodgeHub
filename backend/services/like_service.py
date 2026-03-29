from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from models.article import Article, ArticleStatus
from models.comment import ArticleComment
from models.like import ArticleLike, CommentLike
from models.user import User
from schemas.like import LikeSummary


# ── Helpers ──────────────────────────────────────────────────────────────────

def _get_published_article(article_id: int, organization_id: int, db: Session) -> Article:
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


def _get_comment_in_org(comment_id: int, organization_id: int, db: Session) -> ArticleComment:
    comment = (
        db.query(ArticleComment)
        .filter(
            ArticleComment.id == comment_id,
            ArticleComment.organization_id == organization_id,
        )
        .first()
    )
    if not comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")
    return comment


def _article_like_summary(article_id: int, user_id: int, db: Session) -> LikeSummary:
    like_count = (
        db.query(func.count(ArticleLike.id))
        .filter(ArticleLike.article_id == article_id)
        .scalar()
    )
    liked = (
        db.query(ArticleLike)
        .filter(ArticleLike.article_id == article_id, ArticleLike.user_id == user_id)
        .first()
    ) is not None
    return LikeSummary(liked=liked, like_count=like_count)


def _comment_like_summary(comment_id: int, user_id: int, db: Session) -> LikeSummary:
    like_count = (
        db.query(func.count(CommentLike.id))
        .filter(CommentLike.comment_id == comment_id)
        .scalar()
    )
    liked = (
        db.query(CommentLike)
        .filter(CommentLike.comment_id == comment_id, CommentLike.user_id == user_id)
        .first()
    ) is not None
    return LikeSummary(liked=liked, like_count=like_count)


# ── Article likes ─────────────────────────────────────────────────────────────

def like_article(article_id: int, current_user: User, db: Session) -> LikeSummary:
    article = _get_published_article(article_id, current_user.organization_id, db)

    existing = (
        db.query(ArticleLike)
        .filter(ArticleLike.article_id == article_id, ArticleLike.user_id == current_user.id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Already liked")

    db.add(ArticleLike(
        organization_id=current_user.organization_id,
        article_id=article.id,
        user_id=current_user.id,
    ))
    db.commit()
    return _article_like_summary(article_id, current_user.id, db)


def unlike_article(article_id: int, current_user: User, db: Session) -> LikeSummary:
    _get_published_article(article_id, current_user.organization_id, db)

    like = (
        db.query(ArticleLike)
        .filter(ArticleLike.article_id == article_id, ArticleLike.user_id == current_user.id)
        .first()
    )
    if not like:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Like not found")

    db.delete(like)
    db.commit()
    return _article_like_summary(article_id, current_user.id, db)


# ── Comment likes ─────────────────────────────────────────────────────────────

def like_comment(comment_id: int, current_user: User, db: Session) -> LikeSummary:
    comment = _get_comment_in_org(comment_id, current_user.organization_id, db)

    # Ensure the parent article is published
    _get_published_article(comment.article_id, current_user.organization_id, db)

    existing = (
        db.query(CommentLike)
        .filter(CommentLike.comment_id == comment_id, CommentLike.user_id == current_user.id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Already liked")

    db.add(CommentLike(
        organization_id=current_user.organization_id,
        comment_id=comment.id,
        user_id=current_user.id,
    ))
    db.commit()
    return _comment_like_summary(comment_id, current_user.id, db)


def unlike_comment(comment_id: int, current_user: User, db: Session) -> LikeSummary:
    comment = _get_comment_in_org(comment_id, current_user.organization_id, db)
    _get_published_article(comment.article_id, current_user.organization_id, db)

    like = (
        db.query(CommentLike)
        .filter(CommentLike.comment_id == comment_id, CommentLike.user_id == current_user.id)
        .first()
    )
    if not like:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Like not found")

    db.delete(like)
    db.commit()
    return _comment_like_summary(comment_id, current_user.id, db)
