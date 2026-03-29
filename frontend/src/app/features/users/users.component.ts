import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { UserService } from '../../core/services/user.service';
import { DepartmentService, Department } from '../../core/services/department.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-users',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page">
      <h1>Users</h1>

      <!-- Users Table -->
      @if (loadError) {
        <p class="error-msg" data-testid="users-load-error">{{ loadError }}</p>
      }

      @if (!loadError) {
        <table class="data-table" data-testid="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Department</th>
            </tr>
          </thead>
          <tbody>
            @for (user of users; track user.id) {
              <tr data-testid="users-row">
                <td>{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td><span class="role-badge role-{{ user.role }}">{{ user.role }}</span></td>
                <td>{{ getDepartmentName(user.department_id) }}</td>
              </tr>
            } @empty {
              <tr>
                <td colspan="4" class="empty-msg">No users found.</td>
              </tr>
            }
          </tbody>
        </table>
      }

      <!-- Create User Form -->
      <div class="form-section">
        <h2>Create User</h2>

        @if (submitError) {
          <p class="error-msg" data-testid="create-user-error">{{ submitError }}</p>
        }
        @if (submitSuccess) {
          <p class="success-msg" data-testid="create-user-success">User created successfully.</p>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="create-form">
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
            <label for="department">Department</label>
            <select id="department" formControlName="department_id" data-testid="create-user-department">
              <option [ngValue]="null">None</option>
              @for (dept of departments; track dept.id) {
                <option [ngValue]="dept.id">{{ dept.name }}</option>
              }
            </select>
          </div>

          <button
            type="submit"
            [disabled]="form.invalid || submitting"
            data-testid="create-user-submit"
          >
            {{ submitting ? 'Creating...' : 'Create User' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .page { max-width: 860px; }
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
    .empty-msg { color: #94a3b8; text-align: center; }

    .role-badge {
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .role-ORG_ADMIN { background: #dbeafe; color: #1d4ed8; }
    .role-MANAGER   { background: #fef9c3; color: #a16207; }
    .role-EMPLOYEE  { background: #dcfce7; color: #166534; }

    .form-section {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 1.5rem;
    }
    .create-form { display: flex; flex-direction: column; gap: 1rem; max-width: 420px; }

    .field { display: flex; flex-direction: column; gap: 0.3rem; }
    label { font-size: 0.875rem; font-weight: 500; color: #374151; }
    input, select {
      padding: 0.5rem 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-size: 0.9rem;
      color: #1e293b;
    }
    input:focus, select:focus { outline: 2px solid #3b82f6; outline-offset: -1px; }
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

    .error-msg { color: #dc2626; font-size: 0.9rem; margin-bottom: 1rem; }
    .success-msg { color: #16a34a; font-size: 0.9rem; margin-bottom: 1rem; }
  `],
})
export class UsersComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly departmentService = inject(DepartmentService);
  private readonly fb = inject(FormBuilder);

  users: User[] = [];
  departments: Department[] = [];
  loadError: string | null = null;
  submitError: string | null = null;
  submitSuccess = false;
  submitting = false;

  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    role: ['EMPLOYEE', Validators.required],
    department_id: [null as number | null],
  });

  ngOnInit(): void {
    this.userService.getUsers().subscribe({
      next: users => (this.users = users),
      error: () => (this.loadError = 'Failed to load users.'),
    });

    this.departmentService.getDepartments().subscribe({
      next: depts => (this.departments = depts),
    });
  }

  getDepartmentName(departmentId: number | null): string {
    if (departmentId === null) return '—';
    return this.departments.find(d => d.id === departmentId)?.name ?? '—';
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.submitting = true;
    this.submitError = null;
    this.submitSuccess = false;

    const value = this.form.getRawValue();

    this.userService.createUser({
      name: value.name!,
      email: value.email!,
      password: value.password!,
      role: value.role!,
      department_id: value.department_id ?? null,
    }).subscribe({
      next: newUser => {
        this.users = [...this.users, newUser];
        this.form.reset({ role: 'EMPLOYEE', department_id: null });
        this.submitSuccess = true;
        this.submitting = false;
      },
      error: err => {
        const status = err?.status;
        if (status === 409) {
          this.submitError = 'A user with this email already exists.';
        } else {
          this.submitError = 'Failed to create user. Please try again.';
        }
        this.submitting = false;
      },
    });
  }
}
