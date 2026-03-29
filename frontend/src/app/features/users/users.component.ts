import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';

import { UserService } from '../../core/services/user.service';
import { DepartmentService, Department } from '../../core/services/department.service';
import { User } from '../../core/models/user.model';
import { UserCreateDialogComponent } from './user-create-dialog/user-create-dialog.component';

@Component({
  selector: 'app-users',
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Users</h1>
        <button class="btn-primary" (click)="openCreateDialog()" data-testid="open-create-user">
          + Create User
        </button>
      </div>

      @if (loading) {
        <p class="status-msg" data-testid="users-loading">Loading...</p>
      }

      @if (loadError) {
        <p class="error-msg" data-testid="users-load-error">{{ loadError }}</p>
      }

      @if (!loading && !loadError) {
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
    </div>
  `,
  styles: [`
    .page { max-width: 860px; }

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

    .role-badge {
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .role-ORG_ADMIN { background: #dbeafe; color: #1d4ed8; }
    .role-MANAGER   { background: #fef9c3; color: #a16207; }
    .role-EMPLOYEE  { background: #dcfce7; color: #166534; }

    .status-msg { color: #64748b; font-size: 0.9rem; }
    .error-msg  { color: #dc2626; font-size: 0.9rem; }
  `],
})
export class UsersComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly departmentService = inject(DepartmentService);
  private readonly dialog = inject(MatDialog);

  users: User[] = [];
  departments: Department[] = [];
  loading = true;
  loadError: string | null = null;

  ngOnInit(): void {
    this.userService.getUsers().subscribe({
      next: users => {
        this.users = users;
        this.loading = false;
      },
      error: () => {
        this.loadError = 'Failed to load users.';
        this.loading = false;
      },
    });

    this.departmentService.getDepartments().subscribe({
      next: depts => (this.departments = depts),
    });
  }

  openCreateDialog(): void {
    this.dialog.open(UserCreateDialogComponent, { width: '500px' })
      .afterClosed()
      .subscribe((newUser: User | undefined) => {
        if (newUser) this.users = [...this.users, newUser];
      });
  }

  getDepartmentName(departmentId: number | null): string {
    if (departmentId === null) return '—';
    return this.departments.find(d => d.id === departmentId)?.name ?? '—';
  }
}
