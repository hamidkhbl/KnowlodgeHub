import { Component, inject } from '@angular/core';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DepartmentDeleteDialogData {
  departmentName: string;
}

@Component({
  selector: 'app-department-delete-dialog',
  imports: [MatDialogModule],
  template: `
    <div mat-dialog-title>Delete Department</div>
    <mat-dialog-content>
      <p>Delete <strong>{{ data.departmentName }}</strong>? This cannot be undone.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button class="btn-secondary" mat-dialog-close>Cancel</button>
      <button
        class="btn-danger"
        (click)="confirm()"
        data-testid="confirm-delete-department"
      >
        Delete
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    [mat-dialog-title] { font-size: 1.1rem; font-weight: 600; color: #1e293b; padding: 1.25rem 1.5rem 0; }
    mat-dialog-content { padding: 1rem 1.5rem; min-width: 320px; }
    mat-dialog-content p { margin: 0; font-size: 0.9rem; color: #374151; }
    mat-dialog-actions { padding: 0.75rem 1.5rem 1.25rem; gap: 0.5rem; }
    .btn-secondary {
      padding: 0.45rem 1.1rem;
      background: transparent;
      color: #374151;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-size: 0.875rem;
      cursor: pointer;
    }
    .btn-secondary:hover { background: #f1f5f9; }
    .btn-danger {
      padding: 0.45rem 1.1rem;
      background: #dc2626;
      color: #fff;
      border: none;
      border-radius: 4px;
      font-size: 0.875rem;
      cursor: pointer;
    }
    .btn-danger:hover { background: #b91c1c; }
  `],
})
export class DepartmentDeleteDialogComponent {
  readonly data: DepartmentDeleteDialogData = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<DepartmentDeleteDialogComponent>);

  confirm(): void {
    this.dialogRef.close(true);
  }
}
