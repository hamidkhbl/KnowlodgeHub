from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from models.article import Article, ArticleStatus
from models.comment import ArticleComment
from models.like import ArticleLike
from models.user import User, UserRole
from schemas.article import CreateArticleRequest, UpdateArticleRequest


def _inject_last_comment(articles: list[Article], db: Session) -> None:
    """Inject last_comment_body and last_comment_author into article __dict__ (batch)."""
    if not articles:
        return
    ids = [a.id for a in articles]

    # One query: for each article, fetch the comment with the highest id (latest)
    subq = (
        db.query(ArticleComment.article_id, func.max(ArticleComment.id).label("max_id"))
        .filter(ArticleComment.article_id.in_(ids))
        .group_by(ArticleComment.article_id)
        .subquery()
    )
    latest = (
        db.query(ArticleComment)
        .join(subq, ArticleComment.id == subq.c.max_id)
        .all()
    )
    latest_by_article = {c.article_id: c for c in latest}

    for article in articles:
        comment = latest_by_article.get(article.id)
        if comment:
            article.__dict__["last_comment_body"] = comment.body
            article.__dict__["last_comment_author"] = comment.author.name
        else:
            article.__dict__["last_comment_body"] = None
            article.__dict__["last_comment_author"] = None


def _inject_like_data(articles: list[Article], current_user: User, db: Session) -> None:
    """Inject like_count and liked_by_current_user into article __dict__ (batch, no N+1)."""
    if not articles:
        return
    ids = [a.id for a in articles]
    counts = dict(
        db.query(ArticleLike.article_id, func.count(ArticleLike.id))
        .filter(ArticleLike.article_id.in_(ids))
        .group_by(ArticleLike.article_id)
        .all()
    )
    liked_ids = {
        row.article_id
        for row in db.query(ArticleLike.article_id)
        .filter(ArticleLike.article_id.in_(ids), ArticleLike.user_id == current_user.id)
        .all()
    }
    for article in articles:
        article.__dict__["like_count"] = counts.get(article.id, 0)
        article.__dict__["liked_by_current_user"] = article.id in liked_ids


def _get_article_in_org(article_id: int, organization_id: int, db: Session) -> Article:
    """Fetch an article scoped to the org, or raise 404."""
    article = (
        db.query(Article)
        .filter(Article.id == article_id, Article.organization_id == organization_id)
        .first()
    )
    if not article:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found")
    return article


def _is_privileged(user: User) -> bool:
    return user.role in (UserRole.ORG_ADMIN, UserRole.MANAGER)


def get_articles(
    current_user: User,
    db: Session,
    q: Optional[str] = None,
    article_status: Optional[ArticleStatus] = None,
    department_id: Optional[int] = None,
) -> list[Article]:
    query = db.query(Article).filter(Article.organization_id == current_user.organization_id)

    # EMPLOYEE can only see published articles in the list
    if current_user.role == UserRole.EMPLOYEE:
        query = query.filter(Article.status == ArticleStatus.PUBLISHED)

    if article_status is not None:
        query = query.filter(Article.status == article_status)

    if department_id is not None:
        query = query.filter(Article.department_id == department_id)

    if q:
        like = f"%{q}%"
        query = query.filter(
            (Article.title.ilike(like)) | (Article.content.ilike(like))
        )

    articles = query.all()
    _inject_like_data(articles, current_user, db)
    _inject_last_comment(articles, db)
    return articles


def get_article(article_id: int, current_user: User, db: Session) -> Article:
    article = _get_article_in_org(article_id, current_user.organization_id, db)

    # EMPLOYEE can only see published articles or their own drafts
    if current_user.role == UserRole.EMPLOYEE:
        if article.status != ArticleStatus.PUBLISHED and article.author_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found")

    _inject_like_data([article], current_user, db)
    _inject_last_comment([article], db)
    return article


def create_article(request: CreateArticleRequest, current_user: User, db: Session) -> Article:
    article = Article(
        organization_id=current_user.organization_id,
        author_id=current_user.id,
        title=request.title,
        content=request.content,
        tags=request.tags,
        status=request.status,
        department_id=request.department_id,
    )
    db.add(article)
    db.commit()
    db.refresh(article)
    return article


def update_article(article_id: int, request: UpdateArticleRequest, current_user: User, db: Session) -> Article:
    article = _get_article_in_org(article_id, current_user.organization_id, db)

    if not _is_privileged(current_user) and article.author_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only edit your own articles")

    article.title = request.title
    article.content = request.content
    article.tags = request.tags
    article.status = request.status
    article.department_id = request.department_id

    db.commit()
    db.refresh(article)
    return article


def delete_article(article_id: int, current_user: User, db: Session) -> None:
    article = _get_article_in_org(article_id, current_user.organization_id, db)

    if not _is_privileged(current_user) and article.author_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only delete your own articles")

    db.delete(article)
    db.commit()
