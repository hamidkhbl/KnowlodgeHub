import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';

import { DepartmentService, Department } from '../../core/services/department.service';
import { AuthService } from '../../core/services/auth.service';
import { DepartmentCreateDialogComponent } from './department-create-dialog/department-create-dialog.component';

@Component({
  selector: 'app-departments',
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Departments</h1>
        @if (isAdmin) {
          <button class="btn-primary" (click)="openCreateDialog()" data-testid="open-create-department">
            + Create Department
          </button>
        }
      </div>

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
    </div>
  `,
  styles: [`
    .page { max-width: 600px; }

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
    .empty-msg { color: #94a3b8; }

    .status-msg { color: #64748b; font-size: 0.9rem; }
    .error-msg  { color: #dc2626; font-size: 0.9rem; }
  `],
})
export class DepartmentsComponent implements OnInit {
  private readonly departmentService = inject(DepartmentService);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);

  departments: Department[] = [];
  loading = true;
  loadError: string | null = null;

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

  openCreateDialog(): void {
    this.dialog.open(DepartmentCreateDialogComponent)
      .afterClosed()
      .subscribe((newDept: Department | undefined) => {
        if (newDept) this.departments = [...this.departments, newDept];
      });
  }
}
