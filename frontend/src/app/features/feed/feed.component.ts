import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { combineLatest, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil, startWith } from 'rxjs/operators';

import { ArticleService, Article } from '../../core/services/article.service';
import { DepartmentService, Department } from '../../core/services/department.service';
import { AuthService } from '../../core/services/auth.service';
import { LikeService } from '../../core/services/like.service';
import { DepartmentTreeSelectComponent } from '../../shared/components/department-tree-select/department-tree-select.component';

@Component({
  selector: 'app-feed',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, DatePipe, DepartmentTreeSelectComponent],
  template: `
    <div class="feed-page">
      <div class="feed-header">
        <h1>Feed</h1>
        <p class="feed-subtitle">Latest published knowledge articles</p>
      </div>

      <div class="feed-toolbar">
        <input
          type="text"
          [formControl]="searchControl"
          placeholder="Search articles..."
          class="search-input"
          data-testid="feed-search-input"
        />
        <div class="dept-filter-wrap">
          <app-department-tree-select
            [formControl]="departmentControl"
            [departments]="departments"
            [orgName]="orgName"
            [allowRoot]="false"
            placeholder="All Departments"
            data-testid="feed-department-filter"
          ></app-department-tree-select>
        </div>
      </div>

      @if (loading) {
        <p class="status-msg" data-testid="feed-loading">Loading...</p>
      }

      @if (error) {
        <p class="error-msg" data-testid="feed-error">{{ error }}</p>
      }

      @if (!loading && !error) {
        @if (articles.length === 0) {
          <div class="empty-state" data-testid="feed-empty-state">
            <p>No published articles found.</p>
          </div>
        } @else {
          <div class="article-list">
            @for (article of articles; track article.id) {
              <div class="article-card" data-testid="feed-article-card">
                <a [routerLink]="['/articles', article.id]" class="card-link">
                  <div class="card-main">
                    <div class="card-header">
                      <span class="card-title">{{ article.title }}</span>
                      @if (article.department_id) {
                        <span class="dept-badge">{{ getDepartmentName(article.department_id) }}</span>
                      }
                    </div>
                    <p class="card-preview">{{ preview(article.content) }}</p>
                    <div class="card-meta">
                      <span>{{ article.author_name }}</span>
                      <span class="dot">·</span>
                      <span>{{ article.created_at | date:'mediumDate' }}</span>
                    </div>
                  </div>
                  @if (article.last_comment_body) {
                    <div class="card-comment" data-testid="feed-last-comment">
                      <svg class="comment-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                      <span class="comment-meta-author">{{ article.last_comment_author }}</span>
                      <p class="comment-meta-body">{{ commentPreview(article.last_comment_body) }}</p>
                    </div>
                  }
                </a>
                <div class="card-actions">
                  <button
                    class="like-btn"
                    [class.liked]="article.liked_by_current_user"
                    [disabled]="likingId === article.id"
                    (click)="onLikeArticle(article)"
                    data-testid="article-like-button"
                    [attr.aria-label]="article.liked_by_current_user ? 'Unlike' : 'Like'"
                  >
                    <svg class="like-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/>
                    </svg>
                    <span data-testid="article-like-count">{{ article.like_count }}</span>
                  </button>
                </div>
              </div>
            }
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .feed-page { max-width: 720px; }

    .feed-header { margin-bottom: 1.5rem; }
    h1 { margin: 0 0 0.25rem; color: #1e293b; }
    .feed-subtitle { margin: 0; color: #64748b; font-size: 0.875rem; }

    .feed-toolbar {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      align-items: flex-start;
    }
    .search-input { flex: 1; min-width: 180px; }
    .dept-filter-wrap { width: 220px; flex-shrink: 0; }
    input {
      padding: 0.5rem 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-size: 0.9rem;
      color: #1e293b;
    }
    input:focus { outline: 2px solid #3b82f6; outline-offset: -1px; }

    .article-list { display: flex; flex-direction: column; gap: 1rem; }

    .article-card {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .article-card:hover {
      border-color: #93c5fd;
      box-shadow: 0 2px 8px rgba(59,130,246,0.08);
    }

    .card-link {
      display: flex;
      align-items: stretch;
      gap: 0;
      padding: 1.25rem 1.5rem 0.75rem;
      text-decoration: none;
      color: inherit;
    }

    .card-main { flex: 1; min-width: 0; }

    .card-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 0.5rem;
    }
    .card-title {
      font-size: 1rem;
      font-weight: 600;
      color: #1e293b;
      line-height: 1.4;
    }
    .dept-badge {
      flex-shrink: 0;
      padding: 0.2rem 0.6rem;
      background: #eff6ff;
      color: #2563eb;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .card-preview {
      margin: 0 0 0.75rem;
      font-size: 0.875rem;
      color: #64748b;
      line-height: 1.6;
    }

    .card-meta {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.8rem;
      color: #94a3b8;
    }
    .dot { color: #cbd5e1; }

    /* ── Last comment panel ──────────────────────────────────────── */
    .card-comment {
      width: 180px;
      flex-shrink: 0;
      margin-left: 1.25rem;
      padding-left: 1.25rem;
      border-left: 1px solid #f1f5f9;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .comment-icon {
      width: 14px;
      height: 14px;
      color: #94a3b8;
      flex-shrink: 0;
      margin-bottom: 0.1rem;
    }
    .comment-meta-author {
      font-size: 0.75rem;
      font-weight: 600;
      color: #475569;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .comment-meta-body {
      margin: 0;
      font-size: 0.75rem;
      color: #94a3b8;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card-actions {
      display: flex;
      align-items: center;
      padding: 0.5rem 1.5rem 0.75rem;
      border-top: 1px solid #f8fafc;
    }

    .like-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      background: none;
      border: none;
      color: #94a3b8;
      font-size: 0.8125rem;
      font-weight: 500;
      cursor: pointer;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      transition: color 0.12s, background 0.12s;
    }
    .like-btn:hover:not(:disabled) { color: #2563eb; background: #eff6ff; }
    .like-btn.liked { color: #2563eb; }
    .like-btn.liked .like-icon { fill: #2563eb; stroke: #2563eb; }
    .like-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .like-icon { width: 15px; height: 15px; flex-shrink: 0; }

    .empty-state {
      text-align: center;
      padding: 3rem 0;
      color: #94a3b8;
    }
    .status-msg { color: #64748b; }
    .error-msg  { color: #dc2626; font-size: 0.9rem; }
  `],
})
export class FeedComponent implements OnInit, OnDestroy {
  private readonly articleService = inject(ArticleService);
  private readonly departmentService = inject(DepartmentService);
  private readonly authService = inject(AuthService);
  private readonly likeService = inject(LikeService);
  private readonly destroy$ = new Subject<void>();

  articles: Article[] = [];
  departments: Department[] = [];
  loading = true;
  error: string | null = null;
  likingId: number | null = null;

  searchControl = new FormControl('');
  departmentControl = new FormControl<number | null>(null);

  get orgName(): string {
    return this.authService.currentUser?.organization_name ?? 'Organization';
  }

  ngOnInit(): void {
    this.departmentService.getDepartments().subscribe({
      next: depts => (this.departments = depts),
    });

    combineLatest([
      this.searchControl.valueChanges.pipe(startWith(''), debounceTime(300), distinctUntilChanged()),
      this.departmentControl.valueChanges.pipe(startWith(null)),
    ]).pipe(
      switchMap(([q, deptId]) => {
        this.loading = true;
        this.error = null;
        const filters: Record<string, string | number> = { status: 'PUBLISHED' };
        if (q) filters['q'] = q;
        if (deptId !== null) filters['department_id'] = deptId;
        return this.articleService.getArticles(filters);
      }),
      takeUntil(this.destroy$),
    ).subscribe({
      next: articles => {
        this.articles = articles;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load articles.';
        this.loading = false;
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  preview(content: string): string {
    return content.length > 150 ? content.slice(0, 150).trimEnd() + '…' : content;
  }

  commentPreview(body: string): string {
    return body.length > 100 ? body.slice(0, 100).trimEnd() + '…' : body;
  }

  getDepartmentName(departmentId: number | null): string {
    if (departmentId === null) return '';
    return this.departments.find(d => d.id === departmentId)?.name ?? '';
  }

  onLikeArticle(article: Article): void {
    if (this.likingId === article.id) return;
    this.likingId = article.id;
    const action = article.liked_by_current_user
      ? this.likeService.unlikeArticle(article.id)
      : this.likeService.likeArticle(article.id);

    action.subscribe({
      next: summary => {
        article.liked_by_current_user = summary.liked;
        article.like_count = summary.like_count;
        this.likingId = null;
      },
      error: () => { this.likingId = null; },
    });
  }
}
