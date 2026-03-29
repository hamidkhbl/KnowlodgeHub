import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';

import { DepartmentService, Department } from '../../../core/services/department.service';

@Component({
  selector: 'app-department-create-dialog',
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  template: `
    <div mat-dialog-title data-testid="department-modal">Create Department</div>

    <mat-dialog-content>
      @if (submitError) {
        <p class="error-msg" data-testid="create-department-error">{{ submitError }}</p>
      }

      <form [formGroup]="form" id="dept-form" (ngSubmit)="onSubmit()" class="dialog-form">
        <div class="field">
          <label for="name">Name</label>
          <input
            id="name"
            type="text"
            formControlName="name"
            data-testid="create-department-name"
            placeholder="Department name"
          />
          @if (form.get('name')?.invalid && form.get('name')?.touched) {
            <span class="field-error">Name is required.</span>
          }
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button class="btn-secondary" mat-dialog-close>Cancel</button>
      <button
        class="btn-primary"
        form="dept-form"
        type="submit"
        [disabled]="form.invalid || submitting"
        data-testid="create-department-submit"
      >
        {{ submitting ? 'Creating...' : 'Create Department' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    [mat-dialog-title] { font-size: 1.1rem; font-weight: 600; color: #1e293b; padding: 1.25rem 1.5rem 0; }
    mat-dialog-content { padding: 1rem 1.5rem; min-width: 360px; }
    mat-dialog-actions { padding: 0.75rem 1.5rem 1.25rem; gap: 0.5rem; }

    .dialog-form { display: flex; flex-direction: column; gap: 1rem; }

    .field { display: flex; flex-direction: column; gap: 0.3rem; }
    label { font-size: 0.875rem; font-weight: 500; color: #374151; }
    input {
      padding: 0.5rem 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-size: 0.9rem;
      color: #1e293b;
      width: 100%;
      box-sizing: border-box;
    }
    input:focus { outline: 2px solid #3b82f6; outline-offset: -1px; }
    .field-error { font-size: 0.8rem; color: #dc2626; }

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
export class DepartmentCreateDialogComponent {
  private readonly departmentService = inject(DepartmentService);
  private readonly dialogRef = inject(MatDialogRef<DepartmentCreateDialogComponent>);
  private readonly fb = inject(FormBuilder);

  submitting = false;
  submitError: string | null = null;

  form = this.fb.group({
    name: ['', Validators.required],
  });

  onSubmit(): void {
    if (this.form.invalid) return;

    this.submitting = true;
    this.submitError = null;

    this.departmentService.createDepartment({ name: this.form.value.name! }).subscribe({
      next: (dept: Department) => this.dialogRef.close(dept),
      error: err => {
        this.submitError = err?.status === 409
          ? 'A department with this name already exists.'
          : 'Failed to create department. Please try again.';
        this.submitting = false;
      },
    });
  }
}
