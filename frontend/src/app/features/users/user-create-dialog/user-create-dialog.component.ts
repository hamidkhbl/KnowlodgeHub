import { Component, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';

import { UserService, CreateUserRequest } from '../../../core/services/user.service';
import { DepartmentService, Department } from '../../../core/services/department.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';
import { DepartmentTreeSelectComponent } from '../../../shared/components/department-tree-select/department-tree-select.component';

@Component({
  selector: 'app-user-create-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, DepartmentTreeSelectComponent],
  template: `
    <div mat-dialog-title data-testid="user-modal">Create User</div>

    <mat-dialog-content>
      @if (submitError) {
        <p class="error-msg" data-testid="create-user-error">{{ submitError }}</p>
      }

      <form [formGroup]="form" id="user-form" (ngSubmit)="onSubmit()" class="dialog-form">
        <div class="field">
          <label for="name">Name</label>
          <input
            id="name"
            type="text"
            formControlName="name"
            data-testid="create-user-name"
            placeholder="Full name"
          />
          @if (form.get('name')?.invalid && form.get('name')?.touched) {
            <span class="field-error">Name is required.</span>
          }
        </div>

        <div class="field">
          <label for="email">Email</label>
          <input
            id="email"
            type="email"
            formControlName="email"
            data-testid="create-user-email"
            placeholder="email@example.com"
          />
          @if (form.get('email')?.invalid && form.get('email')?.touched) {
            <span class="field-error">Valid email is required.</span>
          }
        </div>

        <div class="field">
          <label for="password">Password</label>
          <input
            id="password"
            type="password"
            formControlName="password"
            data-testid="create-user-password"
            placeholder="Password"
          />
          @if (form.get('password')?.invalid && form.get('password')?.touched) {
            <span class="field-error">Password must be at least 8 characters.</span>
          }
        </div>

        <div class="field">
          <label for="role">Role</label>
          <select id="role" formControlName="role" data-testid="create-user-role">
            <option value="EMPLOYEE">Employee</option>
            <option value="MANAGER">Manager</option>
            <option value="ORG_ADMIN">Org Admin</option>
          </select>
        </div>

        <div class="field">
          <label>Department</label>
          <app-department-tree-select
            formControlName="department_id"
            [departments]="departments"
            [orgName]="orgName"
            [allowRoot]="false"
            placeholder="None"
            data-testid="user-department-select"
          ></app-department-tree-select>
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button class="btn-secondary" mat-dialog-close>Cancel</button>
      <button
        class="btn-primary"
        form="user-form"
        type="submit"
        [disabled]="form.invalid || submitting"
        data-testid="create-user-submit"
      >
        {{ submitting ? 'Creating...' : 'Create User' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    [mat-dialog-title] { font-size: 1.1rem; font-weight: 600; color: #1e293b; padding: 1.25rem 1.5rem 0; }
    mat-dialog-content { padding: 1rem 1.5rem; overflow: visible; }
    mat-dialog-actions { padding: 0.75rem 1.5rem 1.25rem; gap: 0.5rem; }

    .dialog-form { display: flex; flex-direction: column; gap: 1rem; }

    .field { display: flex; flex-direction: column; gap: 0.3rem; }
    label { font-size: 0.875rem; font-weight: 500; color: #374151; }
    input, select {
      padding: 0.5rem 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-size: 0.9rem;
      color: #1e293b;
      font-family: inherit;
      width: 100%;
      box-sizing: border-box;
    }
    input:focus, select:focus { outline: 2px solid #3b82f6; outline-offset: -1px; }
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
export class UserCreateDialogComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly departmentService = inject(DepartmentService);
  private readonly authService = inject(AuthService);
  private readonly dialogRef = inject(MatDialogRef<UserCreateDialogComponent>);
  private readonly fb = inject(FormBuilder);

  departments: Department[] = [];
  submitting = false;
  submitError: string | null = null;

  form = this.fb.group({
    name:          ['', Validators.required],
    email:         ['', [Validators.required, Validators.email]],
    password:      ['', [Validators.required, Validators.minLength(8)]],
    role:          ['EMPLOYEE', Validators.required],
    department_id: [null as number | null],
  });

  get orgName(): string {
    return this.authService.currentUser?.organization_name ?? 'Organization';
  }

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
    const request: CreateUserRequest = {
      name:          value.name!,
      email:         value.email!,
      password:      value.password!,
      role:          value.role!,
      department_id: value.department_id ?? null,
    };

    this.userService.createUser(request).subscribe({
      next: (user: User) => this.dialogRef.close(user),
      error: err => {
        this.submitError = err?.status === 409
          ? 'A user with this email already exists.'
          : 'Failed to create user. Please try again.';
        this.submitting = false;
      },
    });
  }
}
