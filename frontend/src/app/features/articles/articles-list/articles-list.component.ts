import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { combineLatest, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil, startWith } from 'rxjs/operators';

import { ArticleService, Article } from '../../../core/services/article.service';
import { DepartmentService, Department } from '../../../core/services/department.service';
import { AuthService } from '../../../core/services/auth.service';
import { ArticleCreateDialogComponent } from '../article-create-dialog/article-create-dialog.component';

@Component({
  selector: 'app-articles-list',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, DatePipe],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Articles</h1>
        <button class="btn-primary" (click)="openCreateDialog()" data-testid="open-create-article">
          + Create Article
        </button>
      </div>

      <!-- Filters -->
      <div class="filters" data-testid="articles-filters">
        <input
          type="text"
          [formControl]="searchControl"
          placeholder="Search articles..."
          data-testid="article-search-input"
          class="search-input"
        />

        <select [formControl]="statusControl" data-testid="article-status-filter">
          <option value="">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
        </select>

        <select [formControl]="departmentControl" data-testid="article-department-filter">
          <option value="">All Departments</option>
          @for (dept of departments; track dept.id) {
            <option [value]="dept.id">{{ dept.name }}</option>
          }
        </select>
      </div>

      <!-- Loading / Error -->
      @if (loading) {
        <p class="status-msg" data-testid="articles-loading">Loading...</p>
      }
      @if (error) {
        <p class="error-msg" data-testid="articles-error">{{ error }}</p>
      }

      <!-- Articles Table -->
      @if (!loading && !error) {
        <table class="data-table" data-testid="articles-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Department</th>
              <th>Author</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            @for (article of articles; track article.id) {
              <tr data-testid="articles-row">
                <td>
                  <a [routerLink]="['/articles', article.id]" class="article-link">
                    {{ article.title }}
                  </a>
                </td>
                <td>
                  <span class="status-badge status-{{ article.status }}">
                    {{ article.status }}
                  </span>
                </td>
                <td>{{ getDepartmentName(article.department_id) }}</td>
                <td>{{ getAuthorLabel(article.author_id) }}</td>
                <td>{{ article.created_at | date:'mediumDate' }}</td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="empty-msg">No articles found.</td>
              </tr>
            }
          </tbody>
        </table>
      }
    </div>
  `,
  styles: [`
    .page { max-width: 960px; }

    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;
    }
    h1 { margin: 0; color: #1e293b; }

    .btn-primary {
      padding: 0.5rem 1.1rem;
      background: #2563eb;
      color: #fff;
      border: none;
      border-radius: 4px;
      font-size: 0.9rem;
      cursor: pointer;
    }
    .btn-primary:hover { background: #1d4ed8; }

    .filters {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 1.25rem;
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

    .data-table {
      width: 100%;
      border-collapse: collapse;
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
    }
    .data-table th {
      background: #f8fafc;
      padding: 0.75rem 1rem;
      text-align: left;
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
      border-bottom: 1px solid #e2e8f0;
    }
    .data-table td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #f1f5f9;
      font-size: 0.9rem;
      color: #1e293b;
    }
    .data-table tr:last-child td { border-bottom: none; }
    .empty-msg { color: #94a3b8; text-align: center; }

    .article-link { color: #2563eb; text-decoration: none; }
    .article-link:hover { text-decoration: underline; }

    .status-badge {
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .status-DRAFT     { background: #fef9c3; color: #a16207; }
    .status-PUBLISHED { background: #dcfce7; color: #166534; }

    .status-msg { color: #64748b; }
    .error-msg  { color: #dc2626; font-size: 0.9rem; }
  `],
})
export class ArticlesListComponent implements OnInit, OnDestroy {
  private readonly articleService = inject(ArticleService);
  private readonly departmentService = inject(DepartmentService);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly destroy$ = new Subject<void>();

  articles: Article[] = [];
  departments: Department[] = [];
  loading = true;
  error: string | null = null;

  searchControl = new FormControl('');
  statusControl = new FormControl('');
  departmentControl = new FormControl('');

  ngOnInit(): void {
    this.departmentService.getDepartments().subscribe({
      next: depts => (this.departments = depts),
    });

    combineLatest([
      this.searchControl.valueChanges.pipe(startWith(''), debounceTime(300), distinctUntilChanged()),
      this.statusControl.valueChanges.pipe(startWith('')),
      this.departmentControl.valueChanges.pipe(startWith('')),
    ]).pipe(
      switchMap(([q, status, deptId]) => {
        this.loading = true;
        this.error = null;
        const filters: Record<string, string | number> = {};
        if (q) filters['q'] = q;
        if (status) filters['status'] = status;
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

  openCreateDialog(): void {
    this.dialog.open(ArticleCreateDialogComponent, { width: '580px' })
      .afterClosed()
      .subscribe((newArticle: Article | undefined) => {
        if (newArticle) this.articles = [newArticle, ...this.articles];
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getDepartmentName(departmentId: number | null): string {
    if (departmentId === null) return '—';
    return this.departments.find(d => d.id === departmentId)?.name ?? '—';
  }

  getAuthorLabel(authorId: number): string {
    const currentUser = this.authService.currentUser;
    if (currentUser?.id === authorId) return currentUser.name;
    return `#${authorId}`;
  }
}
