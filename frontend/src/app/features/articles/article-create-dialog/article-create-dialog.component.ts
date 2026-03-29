import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';

import { ArticleService, Article } from '../../../core/services/article.service';
import { DepartmentService, Department } from '../../../core/services/department.service';

@Component({
  selector: 'app-article-create-dialog',
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  template: `
    <div mat-dialog-title data-testid="article-modal">Create Article</div>

    <mat-dialog-content>
      @if (submitError) {
        <p class="error-msg" data-testid="article-form-error">{{ submitError }}</p>
      }

      <form [formGroup]="form" id="article-form" (ngSubmit)="onSubmit()" class="dialog-form">
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
            rows="6"
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

        <div class="row">
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
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button class="btn-secondary" mat-dialog-close>Cancel</button>
      <button
        class="btn-primary"
        form="article-form"
        type="submit"
        [disabled]="form.invalid || submitting"
        data-testid="article-save-submit"
      >
        {{ submitting ? 'Saving...' : 'Save Article' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    [mat-dialog-title] { font-size: 1.1rem; font-weight: 600; color: #1e293b; padding: 1.25rem 1.5rem 0; }
    mat-dialog-content { padding: 1rem 1.5rem; }
    mat-dialog-actions { padding: 0.75rem 1.5rem 1.25rem; gap: 0.5rem; }

    .dialog-form { display: flex; flex-direction: column; gap: 1rem; }
    .row { display: flex; gap: 1rem; }
    .row .field { flex: 1; }

    .field { display: flex; flex-direction: column; gap: 0.3rem; }
    label { font-size: 0.875rem; font-weight: 500; color: #374151; }
    input, select, textarea {
      padding: 0.5rem 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-size: 0.9rem;
      color: #1e293b;
      font-family: inherit;
      width: 100%;
      box-sizing: border-box;
    }
    textarea { resize: vertical; }
    input:focus, select:focus, textarea:focus { outline: 2px solid #3b82f6; outline-offset: -1px; }
    .field-error { font-size: 0.8rem; color: #dc2626; }
    .field-hint  { font-size: 0.8rem; color: #94a3b8; }

    .btn-primary {
      padding: 0.5rem 1.25rem;
      background: #2563eb;
      color: #fff;
      border: none;
      border-radius: 4px;
      font-size: 0.875rem;
      cursor: pointer;
    }
    .btn-primary:hover:not(:disabled) { background: #1d4ed8; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-secondary {
      padding: 0.5rem 1.25rem;
      background: transparent;
      color: #374151;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-size: 0.875rem;
      cursor: pointer;
    }
    .btn-secondary:hover { background: #f1f5f9; }
    .error-msg { color: #dc2626; font-size: 0.875rem; margin: 0 0 0.5rem; }
  `],
})
export class ArticleCreateDialogComponent implements OnInit {
  private readonly articleService = inject(ArticleService);
  private readonly departmentService = inject(DepartmentService);
  private readonly dialogRef = inject(MatDialogRef<ArticleCreateDialogComponent>);
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
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.submitting = true;
    this.submitError = null;

    const value = this.form.getRawValue();

    this.articleService.createArticle({
      title:         value.title!,
      content:       value.content!,
      tags:          value.tags || null,
      status:        value.status!,
      department_id: value.department_id ?? null,
    }).subscribe({
      next: (article: Article) => this.dialogRef.close(article),
      error: () => {
        this.submitError = 'Failed to save article. Please try again.';
        this.submitting = false;
      },
    });
  }
}
