import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ArticleService, Article } from '../../../core/services/article.service';
import { DepartmentService, Department } from '../../../core/services/department.service';
import { AuthService } from '../../../core/services/auth.service';
import { LikeService } from '../../../core/services/like.service';
import { ArticleCommentsComponent } from '../article-comments/article-comments.component';

@Component({
  selector: 'app-article-detail',
  imports: [CommonModule, RouterLink, DatePipe, ArticleCommentsComponent],
  template: `
    <div class="page">
      @if (loading) {
        <p class="status-msg" data-testid="article-detail-loading">Loading...</p>
      }

      @if (loadError) {
        <p class="error-msg" data-testid="article-detail-error">{{ loadError }}</p>
      }

      @if (!loading && !loadError && article) {
        <div class="detail-header">
          <div class="header-left">
            <a routerLink="/articles" class="back-link">&larr; Articles</a>
            <h1 data-testid="article-detail-title">{{ article.title }}</h1>
          </div>
          <div class="header-actions">
            @if (canEditDelete) {
              <a
                [routerLink]="['/articles', article.id, 'edit']"
                class="btn-secondary"
                data-testid="article-edit-button"
              >
                Edit
              </a>
              <button
                class="btn-danger"
                (click)="onDelete()"
                [disabled]="deleting"
                data-testid="article-delete-button"
              >
                {{ deleting ? 'Deleting...' : 'Delete' }}
              </button>
            }
          </div>
        </div>

        @if (deleteError) {
          <p class="error-msg" data-testid="article-delete-error">{{ deleteError }}</p>
        }

        <div class="meta-row">
          <span class="status-badge status-{{ article.status }}" data-testid="article-detail-status">
            {{ article.status }}
          </span>
          <span class="meta-item" data-testid="article-detail-department">{{ getDepartmentName(article.department_id) }}</span>
          <span class="meta-item" data-testid="article-detail-author">{{ article.author_name }}</span>
          <span class="meta-item" data-testid="article-detail-date">{{ article.created_at | date:'medium' }}</span>
        </div>

        @if (article.tags) {
          <div class="tags-row" data-testid="article-detail-tags">
            @for (tag of parseTags(article.tags); track tag) {
              <span class="tag">{{ tag }}</span>
            }
          </div>
        }

        <div class="content-body" data-testid="article-detail-content">{{ article.content }}</div>

        @if (article.status === 'PUBLISHED') {
          <div class="article-actions">
            <button
              class="like-btn"
              [class.liked]="article.liked_by_current_user"
              [disabled]="likingArticle"
              (click)="onLikeArticle()"
              data-testid="article-like-button"
              [attr.aria-label]="article.liked_by_current_user ? 'Unlike' : 'Like'"
            >
              <svg class="like-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/>
              </svg>
              <span data-testid="article-like-count">{{ article.like_count }}</span>
            </button>
          </div>
          <app-article-comments [articleId]="article.id" />
        }
      }
    </div>
  `,
  styles: [`
    .page { max-width: 760px; }

    .detail-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 1rem;
      gap: 1rem;
    }
    .header-left { display: flex; flex-direction: column; gap: 0.4rem; }
    .back-link { font-size: 0.85rem; color: #64748b; text-decoration: none; }
    .back-link:hover { color: #1e293b; }
    h1 { margin: 0; color: #1e293b; font-size: 1.5rem; }

    .header-actions { display: flex; gap: 0.5rem; flex-shrink: 0; margin-top: 0.25rem; }

    .btn-secondary {
      padding: 0.45rem 1rem;
      background: transparent;
      color: #374151;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-size: 0.875rem;
      text-decoration: none;
      cursor: pointer;
    }
    .btn-secondary:hover { background: #f1f5f9; }

    .btn-danger {
      padding: 0.45rem 1rem;
      background: transparent;
      color: #dc2626;
      border: 1px solid #fca5a5;
      border-radius: 4px;
      font-size: 0.875rem;
      cursor: pointer;
    }
    .btn-danger:hover:not(:disabled) { background: #fef2f2; }
    .btn-danger:disabled { opacity: 0.6; cursor: not-allowed; }

    .meta-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }
    .meta-item { font-size: 0.875rem; color: #64748b; }

    .status-badge {
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .status-DRAFT     { background: #fef9c3; color: #a16207; }
    .status-PUBLISHED { background: #dcfce7; color: #166534; }

    .tags-row { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.25rem; }
    .tag {
      padding: 0.2rem 0.6rem;
      background: #f1f5f9;
      border-radius: 4px;
      font-size: 0.8rem;
      color: #475569;
    }

    .content-body {
      white-space: pre-wrap;
      font-size: 0.95rem;
      line-height: 1.7;
      color: #1e293b;
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 1.5rem;
    }

    .article-actions {
      display: flex;
      align-items: center;
      padding: 0.75rem 0;
      margin-top: 0.5rem;
    }

    .like-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: none;
      border: 1px solid #e2e8f0;
      color: #64748b;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      padding: 0.4rem 0.875rem;
      border-radius: 6px;
      transition: color 0.12s, background 0.12s, border-color 0.12s;
    }
    .like-btn:hover:not(:disabled) { color: #2563eb; background: #eff6ff; border-color: #bfdbfe; }
    .like-btn.liked { color: #2563eb; border-color: #bfdbfe; background: #eff6ff; }
    .like-btn.liked .like-icon { fill: #2563eb; stroke: #2563eb; }
    .like-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .like-icon { width: 16px; height: 16px; flex-shrink: 0; }

    .status-msg { color: #64748b; }
    .error-msg  { color: #dc2626; font-size: 0.9rem; }
  `],
})
export class ArticleDetailComponent implements OnInit {
  private readonly articleService = inject(ArticleService);
  private readonly departmentService = inject(DepartmentService);
  private readonly authService = inject(AuthService);
  private readonly likeService = inject(LikeService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  article: Article | null = null;
  departments: Department[] = [];
  loading = true;
  loadError: string | null = null;
  deleting = false;
  deleteError: string | null = null;
  likingArticle = false;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.departmentService.getDepartments().subscribe({
      next: depts => (this.departments = depts),
    });

    this.articleService.getArticle(id).subscribe({
      next: article => {
        this.article = article;
        this.loading = false;
      },
      error: err => {
        this.loadError = err?.status === 404 ? 'Article not found.' : 'Failed to load article.';
        this.loading = false;
      },
    });
  }

  get canEditDelete(): boolean {
    const user = this.authService.currentUser;
    if (!user || !this.article) return false;
    if (user.role === 'ORG_ADMIN' || user.role === 'MANAGER') return true;
    return user.role === 'EMPLOYEE' && this.article.author_id === user.id;
  }

  onDelete(): void {
    if (!this.article) return;
    this.deleting = true;
    this.deleteError = null;

    this.articleService.deleteArticle(this.article.id).subscribe({
      next: () => this.router.navigate(['/articles']),
      error: () => {
        this.deleteError = 'Failed to delete article.';
        this.deleting = false;
      },
    });
  }

  onLikeArticle(): void {
    if (!this.article || this.likingArticle) return;
    this.likingArticle = true;
    const action = this.article.liked_by_current_user
      ? this.likeService.unlikeArticle(this.article.id)
      : this.likeService.likeArticle(this.article.id);

    action.subscribe({
      next: summary => {
        this.article!.liked_by_current_user = summary.liked;
        this.article!.like_count = summary.like_count;
        this.likingArticle = false;
      },
      error: () => { this.likingArticle = false; },
    });
  }

  getDepartmentName(departmentId: number | null): string {
    if (departmentId === null) return '—';
    return this.departments.find(d => d.id === departmentId)?.name ?? '—';
  }

parseTags(tags: string): string[] {
    return tags.split(',').map(t => t.trim()).filter(Boolean);
  }
}
