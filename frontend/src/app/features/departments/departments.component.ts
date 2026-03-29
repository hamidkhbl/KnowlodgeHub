import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { DepartmentService, Department } from '../../core/services/department.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-departments',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page">
      <h1>Departments</h1>

      <!-- Departments Table -->
      @if (loading) {
        <p class="status-msg" data-testid="departments-loading">Loading...</p>
      }

      @if (loadError) {
        <p class="error-msg" data-testid="departments-load-error">{{ loadError }}</p>
      }

      @if (!loading && !loadError) {
        <table class="data-table" data-testid="departments-table">
          <thead>
            <tr>
              <th>Name</th>
            </tr>
          </thead>
          <tbody>
            @for (dept of departments; track dept.id) {
              <tr data-testid="departments-row">
                <td>{{ dept.name }}</td>
              </tr>
            } @empty {
              <tr>
                <td class="empty-msg">No departments found.</td>
              </tr>
            }
          </tbody>
        </table>
      }

      <!-- Create Department Form (ORG_ADMIN only) -->
      @if (isAdmin) {
        <div class="form-section">
          <h2>Create Department</h2>

          @if (submitError) {
            <p class="error-msg" data-testid="create-department-error">{{ submitError }}</p>
          }
          @if (submitSuccess) {
            <p class="success-msg" data-testid="create-department-success">Department created successfully.</p>
          }

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="create-form">
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

            <button
              type="submit"
              [disabled]="form.invalid || submitting"
              data-testid="create-department-submit"
            >
              {{ submitting ? 'Creating...' : 'Create Department' }}
            </button>
          </form>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { max-width: 600px; }
    h1 { margin: 0 0 1.5rem; color: #1e293b; }
    h2 { margin: 0 0 1rem; font-size: 1.1rem; color: #1e293b; }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 2rem;
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
    .empty-msg { color: #94a3b8; }

    .form-section {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 1.5rem;
    }
    .create-form { display: flex; flex-direction: column; gap: 1rem; max-width: 360px; }

    .field { display: flex; flex-direction: column; gap: 0.3rem; }
    label { font-size: 0.875rem; font-weight: 500; color: #374151; }
    input {
      padding: 0.5rem 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-size: 0.9rem;
      color: #1e293b;
    }
    input:focus { outline: 2px solid #3b82f6; outline-offset: -1px; }
    .field-error { font-size: 0.8rem; color: #dc2626; }

    button[type="submit"] {
      padding: 0.6rem 1.25rem;
      background: #2563eb;
      color: #fff;
      border: none;
      border-radius: 4px;
      font-size: 0.9rem;
      cursor: pointer;
      align-self: flex-start;
    }
    button[type="submit"]:hover:not(:disabled) { background: #1d4ed8; }
    button[type="submit"]:disabled { opacity: 0.6; cursor: not-allowed; }

    .status-msg { color: #64748b; font-size: 0.9rem; margin-bottom: 1rem; }
    .error-msg { color: #dc2626; font-size: 0.9rem; margin-bottom: 1rem; }
    .success-msg { color: #16a34a; font-size: 0.9rem; margin-bottom: 1rem; }
  `],
})
export class DepartmentsComponent implements OnInit {
  private readonly departmentService = inject(DepartmentService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  departments: Department[] = [];
  loading = true;
  loadError: string | null = null;
  submitError: string | null = null;
  submitSuccess = false;
  submitting = false;

  form = this.fb.group({
    name: ['', Validators.required],
  });

  get isAdmin(): boolean {
    return this.authService.currentUser?.role === 'ORG_ADMIN';
  }

  ngOnInit(): void {
    this.departmentService.getDepartments().subscribe({
      next: depts => {
        this.departments = depts;
        this.loading = false;
      },
      error: () => {
        this.loadError = 'Failed to load departments.';
        this.loading = false;
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.submitting = true;
    this.submitError = null;
    this.submitSuccess = false;

    this.departmentService.createDepartment({ name: this.form.value.name! }).subscribe({
      next: newDept => {
        this.departments = [...this.departments, newDept];
        this.form.reset();
        this.submitSuccess = true;
        this.submitting = false;
      },
      error: err => {
        if (err?.status === 409) {
          this.submitError = 'A department with this name already exists.';
        } else {
          this.submitError = 'Failed to create department. Please try again.';
        }
        this.submitting = false;
      },
    });
  }
}
