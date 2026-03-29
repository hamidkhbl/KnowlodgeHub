import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ArticleService, Article, CreateArticleRequest } from '../../../core/services/article.service';
import { DepartmentService, Department } from '../../../core/services/department.service';

@Component({
  selector: 'app-article-form',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page">
      <h1>{{ article ? 'Edit Article' : 'Create Article' }}</h1>

      @if (submitError) {
        <p class="error-msg" data-testid="article-form-error">{{ submitError }}</p>
      }

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="article-form">
        <div class="field">
          <label for="title">Title</label>
          <input
            id="title"
            type="text"
            formControlName="title"
            data-testid="article-title"
            placeholder="Article title"
          />
          @if (form.get('title')?.invalid && form.get('title')?.touched) {
            <span class="field-error">Title is required.</span>
          }
        </div>

        <div class="field">
          <label for="content">Content</label>
          <textarea
            id="content"
            formControlName="content"
            data-testid="article-content"
            placeholder="Article content"
            rows="10"
          ></textarea>
          @if (form.get('content')?.invalid && form.get('content')?.touched) {
            <span class="field-error">Content is required.</span>
          }
        </div>

        <div class="field">
          <label for="tags">Tags</label>
          <input
            id="tags"
            type="text"
            formControlName="tags"
            data-testid="article-tags"
            placeholder="e.g. vpn,onboarding,it"
          />
          <span class="field-hint">Comma-separated tags</span>
        </div>

        <div class="field">
          <label for="status">Status</label>
          <select id="status" formControlName="status" data-testid="article-status">
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </select>
        </div>

        <div class="field">
          <label for="department">Department</label>
          <select id="department" formControlName="department_id" data-testid="article-department">
            <option [ngValue]="null">None</option>
            @for (dept of departments; track dept.id) {
              <option [ngValue]="dept.id">{{ dept.name }}</option>
            }
          </select>
        </div>

        <div class="form-actions">
          <button
            type="submit"
            [disabled]="form.invalid || submitting"
            data-testid="article-save-submit"
          >
            {{ submitting ? 'Saving...' : 'Save Article' }}
          </button>
          <button type="button" class="btn-secondary" (click)="onCancel()">
            Cancel
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .page { max-width: 720px; }
    h1 { margin: 0 0 1.5rem; color: #1e293b; }

    .article-form { display: flex; flex-direction: column; gap: 1.25rem; }

    .field { display: flex; flex-direction: column; gap: 0.3rem; }
    label { font-size: 0.875rem; font-weight: 500; color: #374151; }
    input, select, textarea {
      padding: 0.5rem 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-size: 0.9rem;
      color: #1e293b;
      font-family: inherit;
    }
    textarea { resize: vertical; }
    input:focus, select:focus, textarea:focus {
      outline: 2px solid #3b82f6;
      outline-offset: -1px;
    }
    .field-error { font-size: 0.8rem; color: #dc2626; }
    .field-hint  { font-size: 0.8rem; color: #94a3b8; }

    .form-actions { display: flex; gap: 0.75rem; }
    button[type="submit"] {
      padding: 0.6rem 1.25rem;
      background: #2563eb;
      color: #fff;
      border: none;
      border-radius: 4px;
      font-size: 0.9rem;
      cursor: pointer;
    }
    button[type="submit"]:hover:not(:disabled) { background: #1d4ed8; }
    button[type="submit"]:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-secondary {
      padding: 0.6rem 1.25rem;
      background: transparent;
      color: #374151;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-size: 0.9rem;
      cursor: pointer;
    }
    .btn-secondary:hover { background: #f1f5f9; }

    .error-msg { color: #dc2626; font-size: 0.9rem; margin-bottom: 0.5rem; }
  `],
})
export class ArticleFormComponent implements OnInit {
  @Input() article: Article | null = null;

  private readonly articleService = inject(ArticleService);
  private readonly departmentService = inject(DepartmentService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  departments: Department[] = [];
  submitting = false;
  submitError: string | null = null;

  form = this.fb.group({
    title:         ['', Validators.required],
    content:       ['', Validators.required],
    tags:          ['' as string | null],
    status:        ['DRAFT' as 'DRAFT' | 'PUBLISHED', Validators.required],
    department_id: [null as number | null],
  });

  ngOnInit(): void {
    this.departmentService.getDepartments().subscribe({
      next: depts => (this.departments = depts),
    });

    if (this.article) {
      this.form.patchValue({
        title:         this.article.title,
        content:       this.article.content,
        tags:          this.article.tags ?? '',
        status:        this.article.status,
        department_id: this.article.department_id,
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.submitting = true;
    this.submitError = null;

    const value = this.form.getRawValue();
    const request: CreateArticleRequest = {
      title:         value.title!,
      content:       value.content!,
      tags:          value.tags || null,
      status:        value.status!,
      department_id: value.department_id ?? null,
    };

    const call$ = this.article
      ? this.articleService.updateArticle(this.article.id, request)
      : this.articleService.createArticle(request);

    call$.subscribe({
      next: saved => {
        this.router.navigate(['/articles', saved.id]);
      },
      error: () => {
        this.submitError = 'Failed to save article. Please try again.';
        this.submitting = false;
      },
    });
  }

  onCancel(): void {
    if (this.article) {
      this.router.navigate(['/articles', this.article.id]);
    } else {
      this.router.navigate(['/articles']);
    }
  }
}
