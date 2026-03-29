import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { combineLatest, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil, startWith } from 'rxjs/operators';

import { ArticleService, Article } from '../../core/services/article.service';
import { DepartmentService, Department } from '../../core/services/department.service';

@Component({
  selector: 'app-feed',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, DatePipe],
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
        <select [formControl]="departmentControl" data-testid="feed-department-filter">
          <option value="">All Departments</option>
          @for (dept of departments; track dept.id) {
            <option [value]="dept.id">{{ dept.name }}</option>
          }
        </select>
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
              <a
                [routerLink]="['/articles', article.id]"
                class="article-card"
                data-testid="feed-article-card"
              >
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
              </a>
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
    }
    .search-input { flex: 1; min-width: 180px; }
    input, select {
      padding: 0.5rem 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-size: 0.9rem;
      color: #1e293b;
    }
    input:focus, select:focus { outline: 2px solid #3b82f6; outline-offset: -1px; }

    .article-list { display: flex; flex-direction: column; gap: 1rem; }

    .article-card {
      display: block;
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 1.25rem 1.5rem;
      text-decoration: none;
      color: inherit;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .article-card:hover {
      border-color: #93c5fd;
      box-shadow: 0 2px 8px rgba(59,130,246,0.08);
    }

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
  private readonly destroy$ = new Subject<void>();

  articles: Article[] = [];
  departments: Department[] = [];
  loading = true;
  error: string | null = null;

  searchControl = new FormControl('');
  departmentControl = new FormControl('');

  ngOnInit(): void {
    this.departmentService.getDepartments().subscribe({
      next: depts => (this.departments = depts),
    });

    combineLatest([
      this.searchControl.valueChanges.pipe(startWith(''), debounceTime(300), distinctUntilChanged()),
      this.departmentControl.valueChanges.pipe(startWith('')),
    ]).pipe(
      switchMap(([q, deptId]) => {
        this.loading = true;
        this.error = null;
        const filters: Record<string, string | number> = { status: 'PUBLISHED' };
        if (q) filters['q'] = q;
        if (deptId) filters['department_id'] = Number(deptId);
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

  getDepartmentName(departmentId: number | null): string {
    if (departmentId === null) return '';
    return this.departments.find(d => d.id === departmentId)?.name ?? '';
  }
}
