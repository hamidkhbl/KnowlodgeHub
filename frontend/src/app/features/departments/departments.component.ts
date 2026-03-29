import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';

import { DepartmentService, Department } from '../../core/services/department.service';
import { AuthService } from '../../core/services/auth.service';
import {
  DepartmentDeleteDialogComponent,
  DepartmentDeleteDialogData,
} from './department-delete-dialog/department-delete-dialog.component';

export interface FlatNode {
  id: number | null;
  name: string;
  depth: number;
  parentId: number | null;
  isRoot: boolean;
  expanded: boolean;
  hasChildren: boolean;
}

interface PendingAdd {
  parentId: number | null;
  depth: number;
  insertAfterIndex: number;
}

const FLIP_DURATION = 200; // ms

@Component({
  selector: 'app-departments',
  imports: [CommonModule, ReactiveFormsModule, DragDropModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Departments</h1>
      </div>

      @if (loading) {
        <p class="status-msg" data-testid="departments-loading">Loading...</p>
      }
      @if (loadError) {
        <p class="error-msg" data-testid="departments-load-error">{{ loadError }}</p>
      }
      @if (actionError) {
        <p class="error-msg action-error" data-testid="departments-action-error">{{ actionError }}</p>
      }

      @if (!loading && !loadError) {
        <div class="tree-container" data-testid="department-tree" cdkDropListGroup>

          @for (node of visibleNodes; track trackNode(node); let i = $index) {

            @if (pending && pending.insertAfterIndex === i) {
              <div class="inline-add-row" [style.padding-left.px]="pending.depth * 28 + 12">
                <input
                  type="text"
                  [formControl]="inlineNameControl"
                  placeholder="Department name"
                  data-testid="department-inline-name"
                  class="inline-input"
                  (keydown.enter)="saveInline()"
                  (keydown.escape)="cancelInline()"
                  autofocus
                />
                <button
                  class="btn-save"
                  (click)="saveInline()"
                  [disabled]="inlineNameControl.invalid || saving"
                  data-testid="save-inline-department"
                >{{ saving ? '…' : 'Save' }}</button>
                <button class="btn-cancel" (click)="cancelInline()">Cancel</button>
              </div>
            }

            <div
              cdkDropList
              [id]="'drop-' + (node.isRoot ? 'root' : node.id)"
              [cdkDropListData]="node"
              (cdkDropListDropped)="onDrop($event)"
              [cdkDropListSortingDisabled]="true"
              class="drop-zone"
              [class.drag-over]="dragOverId === (node.isRoot ? 'root' : node.id)"
              [attr.data-flip-key]="node.isRoot ? 'root' : node.id"
            >
              <div
                cdkDrag
                [cdkDragData]="node"
                [cdkDragDisabled]="node.isRoot"
                class="tree-row"
                [class.root-row]="node.isRoot"
                [class.dept-row]="!node.isRoot"
                [style.padding-left.px]="node.depth * 28 + 12"
                [attr.data-testid]="node.isRoot ? 'organization-root-node' : 'department-node'"
                (cdkDragStarted)="onDragStarted(node)"
                (cdkDragEnded)="onDragEnded()"
              >
                @if (!node.isRoot) {
                  <span
                    cdkDragHandle
                    class="drag-handle"
                    title="Drag to move"
                    data-testid="drag-department"
                  >⠿</span>
                }

                <button
                  class="toggle-btn"
                  (click)="toggleExpand(node)"
                  [disabled]="!node.hasChildren"
                  [attr.aria-expanded]="node.expanded"
                >
                  @if (node.hasChildren) {
                    <span>{{ node.expanded ? '▾' : '▸' }}</span>
                  } @else {
                    <span class="spacer">&#8203;</span>
                  }
                </button>

                <span class="node-name" [class.root-name]="node.isRoot">{{ node.name }}</span>
                @if (node.isRoot) {
                  <span class="root-badge">Organization</span>
                }

                @if (isAdmin) {
                  <span class="row-actions">
                    @if (node.isRoot) {
                      <button
                        class="btn-action"
                        (click)="startInlineAdd(node, i)"
                        data-testid="add-root-department"
                        title="Add top-level department"
                      >+ Add Department</button>
                    } @else {
                      <button
                        class="btn-icon btn-move"
                        (click)="moveUp(node)"
                        [disabled]="isFirstSibling(node)"
                        data-testid="move-up-department"
                        title="Move up"
                        aria-label="Move up"
                      >▲</button>
                      <button
                        class="btn-icon btn-move"
                        (click)="moveDown(node)"
                        [disabled]="isLastSibling(node)"
                        data-testid="move-down-department"
                        title="Move down"
                        aria-label="Move down"
                      >▼</button>
                      <button
                        class="btn-action"
                        (click)="startInlineAdd(node, i)"
                        data-testid="add-sub-department"
                        title="Add sub-department"
                      >+ Sub-Department</button>
                      <button
                        class="btn-icon btn-delete"
                        (click)="openDeleteDialog(node)"
                        data-testid="delete-department"
                        title="Delete department"
                      >✕</button>
                    }
                  </span>
                }

                <div *cdkDragPlaceholder class="drag-placeholder"></div>
                <div *cdkDragPreview class="drag-preview">{{ node.name }}</div>
              </div>
            </div>

          }

          @if (pending && pending.insertAfterIndex === visibleNodes.length) {
            <div class="inline-add-row" [style.padding-left.px]="pending.depth * 28 + 12">
              <input
                type="text"
                [formControl]="inlineNameControl"
                placeholder="Department name"
                data-testid="department-inline-name"
                class="inline-input"
                (keydown.enter)="saveInline()"
                (keydown.escape)="cancelInline()"
                autofocus
              />
              <button
                class="btn-save"
                (click)="saveInline()"
                [disabled]="inlineNameControl.invalid || saving"
                data-testid="save-inline-department"
              >{{ saving ? '…' : 'Save' }}</button>
              <button class="btn-cancel" (click)="cancelInline()">Cancel</button>
            </div>
          }

        </div>
      }
    </div>
  `,
  styles: [`
    .page { max-width: 720px; }
    .page-header { margin-bottom: 1.5rem; }
    h1 { margin: 0; color: #1e293b; }

    .tree-container {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: visible;
    }

    .drop-zone {
      display: block;
      border-bottom: 1px solid #f1f5f9;
      /* will-change lets the browser hoist each row onto its own compositor layer
         so translateY animations run on GPU and don't repaint neighbours */
      will-change: transform;
    }
    .drop-zone:last-child { border-bottom: none; }
    .drop-zone.drag-over { background: #eff6ff; }

    /* FLIP highlight: applied briefly after a successful move */
    .drop-zone.node-moved .tree-row {
      background: #f0fdf4 !important;
      transition: background 500ms ease;
    }

    /* Respect user motion preferences — also makes headless test runs deterministic */
    @media (prefers-reduced-motion: reduce) {
      .drop-zone { transition: none !important; transform: none !important; }
    }

    .tree-row {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      padding-top: 0.45rem;
      padding-bottom: 0.45rem;
      padding-right: 0.75rem;
      min-height: 38px;
      box-sizing: border-box;
      cursor: default;
    }
    .root-row { background: #f8fafc; }
    .dept-row:hover { background: #fafafa; }

    .drag-handle {
      cursor: grab;
      color: #94a3b8;
      font-size: 1rem;
      padding: 0 0.1rem;
      flex-shrink: 0;
      user-select: none;
    }
    .drag-handle:active { cursor: grabbing; }

    .toggle-btn {
      background: none;
      border: none;
      padding: 0;
      width: 1.1rem;
      text-align: center;
      color: #64748b;
      font-size: 0.8rem;
      cursor: pointer;
      flex-shrink: 0;
    }
    .toggle-btn:disabled { cursor: default; color: transparent; }
    .spacer { display: inline-block; width: 1rem; }

    .node-name {
      font-size: 0.9rem;
      color: #1e293b;
      flex: 1;
    }
    .root-name { font-weight: 600; font-size: 0.95rem; }

    .root-badge {
      font-size: 0.7rem;
      background: #dbeafe;
      color: #1d4ed8;
      padding: 0.1rem 0.5rem;
      border-radius: 999px;
      font-weight: 500;
      flex-shrink: 0;
    }

    .row-actions {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      flex-shrink: 0;
    }

    .btn-action {
      background: none;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      padding: 0.2rem 0.55rem;
      font-size: 0.78rem;
      color: #475569;
      cursor: pointer;
      white-space: nowrap;
    }
    .btn-action:hover { background: #f1f5f9; border-color: #94a3b8; }

    .btn-icon {
      background: none;
      border: none;
      padding: 0.2rem 0.35rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.7rem;
      line-height: 1;
      color: #94a3b8;
    }
    .btn-move:hover:not(:disabled) { color: #2563eb; background: #eff6ff; }
    .btn-move:disabled { opacity: 0.3; cursor: default; }
    .btn-delete:hover { color: #dc2626; background: #fee2e2; }

    .inline-add-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding-top: 0.4rem;
      padding-bottom: 0.4rem;
      padding-right: 0.75rem;
      background: #f0f9ff;
      border-bottom: 1px solid #bae6fd;
    }
    .inline-input {
      flex: 1;
      padding: 0.3rem 0.6rem;
      border: 1px solid #60a5fa;
      border-radius: 4px;
      font-size: 0.875rem;
      outline: none;
      color: #1e293b;
    }
    .inline-input:focus { border-color: #2563eb; box-shadow: 0 0 0 2px #bfdbfe; }

    .btn-save {
      padding: 0.3rem 0.75rem;
      background: #2563eb;
      color: #fff;
      border: none;
      border-radius: 4px;
      font-size: 0.8rem;
      cursor: pointer;
      white-space: nowrap;
    }
    .btn-save:hover:not(:disabled) { background: #1d4ed8; }
    .btn-save:disabled { opacity: 0.55; cursor: not-allowed; }

    .btn-cancel {
      padding: 0.3rem 0.6rem;
      background: transparent;
      color: #64748b;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      font-size: 0.8rem;
      cursor: pointer;
    }
    .btn-cancel:hover { background: #f1f5f9; }

    .drag-placeholder {
      background: #e0f2fe;
      border: 2px dashed #38bdf8;
      border-radius: 4px;
      height: 36px;
      display: block;
    }
    .drag-preview {
      background: #1e40af;
      color: #fff;
      padding: 0.35rem 0.85rem;
      border-radius: 4px;
      font-size: 0.875rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }

    .status-msg { color: #64748b; font-size: 0.9rem; }
    .error-msg  { color: #dc2626; font-size: 0.9rem; }
    .action-error { margin-top: 0.75rem; }
  `],
})
export class DepartmentsComponent implements OnInit {
  private readonly departmentService = inject(DepartmentService);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly fb = inject(FormBuilder);

  departments: Department[] = [];
  visibleNodes: FlatNode[] = [];

  loading = true;
  loadError: string | null = null;
  actionError: string | null = null;
  saving = false;

  pending: PendingAdd | null = null;
  inlineNameControl = this.fb.control('', Validators.required);

  draggingNodeId: number | null = null;
  dragOverId: number | 'root' | null = null;

  get isAdmin(): boolean {
    return this.authService.currentUser?.role === 'ORG_ADMIN';
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.loadError = null;
    this.departmentService.getDepartments().subscribe({
      next: depts => {
        this.departments = depts;
        this.visibleNodes = this.buildFlatList(depts);
        this.loading = false;
      },
      error: () => {
        this.loadError = 'Failed to load departments.';
        this.loading = false;
      },
    });
  }

  // ── Tree building ──────────────────────────────────────────────────────────

  private buildFlatList(depts: Department[]): FlatNode[] {
    const orgName = this.authService.currentUser?.organization_name ?? 'Organization';
    const childMap = new Map<number | null, Department[]>();

    for (const d of depts) {
      const key = d.parent_department_id;
      if (!childMap.has(key)) childMap.set(key, []);
      childMap.get(key)!.push(d);
    }

    const flat: FlatNode[] = [];
    const collapsedIds = new Set(this.visibleNodes.filter(n => !n.expanded).map(n => n.id));

    flat.push({
      id: null,
      name: orgName,
      depth: 0,
      parentId: null,
      isRoot: true,
      expanded: true,
      hasChildren: (childMap.get(null)?.length ?? 0) > 0,
    });

    const walk = (parentId: number | null, depth: number) => {
      const children = childMap.get(parentId) ?? [];
      for (const d of children) {
        const hasChildren = (childMap.get(d.id)?.length ?? 0) > 0;
        const node: FlatNode = {
          id: d.id,
          name: d.name,
          depth,
          parentId: d.parent_department_id,
          isRoot: false,
          expanded: !collapsedIds.has(d.id),
          hasChildren,
        };
        flat.push(node);
        if (node.expanded) walk(d.id, depth + 1);
      }
    };

    walk(null, 1);
    return flat;
  }

  trackNode(node: FlatNode): string {
    return node.isRoot ? 'root' : String(node.id);
  }

  // ── Expand / collapse ─────────────────────────────────────────────────────

  toggleExpand(node: FlatNode): void {
    node.expanded = !node.expanded;
    this.visibleNodes = this.buildFlatList(this.departments);
  }

  // ── Sibling order helpers ─────────────────────────────────────────────────

  private siblings(node: FlatNode): Department[] {
    return this.departments.filter(d => d.parent_department_id === node.parentId);
  }

  isFirstSibling(node: FlatNode): boolean {
    const s = this.siblings(node);
    return s.length === 0 || s[0].id === node.id;
  }

  isLastSibling(node: FlatNode): boolean {
    const s = this.siblings(node);
    return s.length === 0 || s[s.length - 1].id === node.id;
  }

  // ── Move Up / Down ────────────────────────────────────────────────────────

  moveUp(node: FlatNode): void {
    const s = this.siblings(node);
    const idx = s.findIndex(d => d.id === node.id);
    if (idx <= 0) return;

    const snapshot = this.snapshotPositions();
    this.swapSiblings(node.id as number, s[idx - 1].id);
    requestAnimationFrame(() => this.playFlip(snapshot, node.id as number));
  }

  moveDown(node: FlatNode): void {
    const s = this.siblings(node);
    const idx = s.findIndex(d => d.id === node.id);
    if (idx < 0 || idx >= s.length - 1) return;

    const snapshot = this.snapshotPositions();
    this.swapSiblings(node.id as number, s[idx + 1].id);
    requestAnimationFrame(() => this.playFlip(snapshot, node.id as number));
  }

  private swapSiblings(idA: number, idB: number): void {
    const depts = [...this.departments];
    const i = depts.findIndex(d => d.id === idA);
    const j = depts.findIndex(d => d.id === idB);
    [depts[i], depts[j]] = [depts[j], depts[i]];
    this.departments = depts;
    this.visibleNodes = this.buildFlatList(this.departments);
  }

  // ── FLIP animation ────────────────────────────────────────────────────────

  private snapshotPositions(): Map<string, number> {
    const map = new Map<string, number>();
    document.querySelectorAll<HTMLElement>('[data-flip-key]').forEach(el => {
      const key = el.dataset['flipKey']!;
      map.set(key, el.getBoundingClientRect().top);
    });
    return map;
  }

  private playFlip(before: Map<string, number>, movedId: number): void {
    // Clear any in-progress FLIP from a previous rapid click
    document.querySelectorAll<HTMLElement>('[data-flip-key]').forEach(el => {
      el.style.transition = 'none';
      el.style.transform = '';
    });

    // Invert: shift each element back to where it was
    const moving: HTMLElement[] = [];
    document.querySelectorAll<HTMLElement>('[data-flip-key]').forEach(el => {
      const key = el.dataset['flipKey']!;
      const oldTop = before.get(key);
      if (oldTop === undefined) return;
      const newTop = el.getBoundingClientRect().top;
      const delta = oldTop - newTop;
      if (Math.abs(delta) < 1) return;
      el.style.transform = `translateY(${delta}px)`;
      moving.push(el);
    });

    if (moving.length === 0) return;

    // Force reflow so the browser commits the inverted transforms
    moving[0].getBoundingClientRect();

    // Play: animate every shifted element to its real position
    moving.forEach(el => {
      el.style.transition = `transform ${FLIP_DURATION}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
      el.style.transform = 'translateY(0)';

      el.addEventListener('transitionend', () => {
        el.style.transition = '';
        el.style.transform = '';

        // Subtle success highlight on the moved department's row
        if (el.dataset['flipKey'] === String(movedId)) {
          el.classList.add('node-moved');
          setTimeout(() => el.classList.remove('node-moved'), 550);
        }
      }, { once: true });
    });
  }

  // ── Inline add ────────────────────────────────────────────────────────────

  startInlineAdd(node: FlatNode, nodeIndex: number): void {
    this.actionError = null;
    this.inlineNameControl.reset('');

    if (!node.isRoot && !node.expanded && node.hasChildren) {
      node.expanded = true;
      this.visibleNodes = this.buildFlatList(this.departments);
    }

    let insertAfterIndex = nodeIndex + 1;
    for (let i = nodeIndex + 1; i < this.visibleNodes.length; i++) {
      if (this.visibleNodes[i].depth > node.depth) insertAfterIndex = i + 1;
      else break;
    }

    this.pending = {
      parentId: node.isRoot ? null : (node.id as number),
      depth: node.depth + 1,
      insertAfterIndex,
    };

    setTimeout(() => {
      document.querySelector<HTMLInputElement>('[data-testid="department-inline-name"]')?.focus();
    }, 0);
  }

  saveInline(): void {
    if (this.inlineNameControl.invalid || !this.pending || this.saving) return;

    this.saving = true;
    this.actionError = null;
    const name = this.inlineNameControl.value!.trim();
    const parentId = this.pending.parentId;

    this.departmentService.createDepartment({ name, parent_department_id: parentId }).subscribe({
      next: newDept => {
        this.departments = [...this.departments, newDept];
        this.pending = null;
        this.saving = false;
        this.visibleNodes = this.buildFlatList(this.departments);
      },
      error: err => {
        this.actionError = err?.error?.detail === 'Department name already exists in this organization'
          ? 'A department with this name already exists.'
          : (err?.error?.detail ?? 'Failed to create department.');
        this.saving = false;
      },
    });
  }

  cancelInline(): void {
    this.pending = null;
    this.inlineNameControl.reset('');
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  openDeleteDialog(node: FlatNode): void {
    this.actionError = null;
    const data: DepartmentDeleteDialogData = { departmentName: node.name };
    this.dialog.open(DepartmentDeleteDialogComponent, { data })
      .afterClosed()
      .subscribe((confirmed: boolean | undefined) => {
        if (confirmed) this.deleteDepartment(node);
      });
  }

  private deleteDepartment(node: FlatNode): void {
    this.departmentService.deleteDepartment(node.id as number).subscribe({
      next: () => {
        this.departments = this.departments.filter(d => d.id !== node.id);
        this.visibleNodes = this.buildFlatList(this.departments);
      },
      error: err => {
        this.actionError = err?.error?.detail ?? 'Failed to delete department.';
      },
    });
  }

  // ── Drag and drop ─────────────────────────────────────────────────────────

  onDragStarted(node: FlatNode): void {
    this.draggingNodeId = node.id as number;
    this.actionError = null;
  }

  onDragEnded(): void {
    this.draggingNodeId = null;
    this.dragOverId = null;
  }

  onDrop(event: CdkDragDrop<FlatNode>): void {
    const dragged: FlatNode = event.item.data;
    const target: FlatNode = event.container.data;

    this.dragOverId = null;

    if (!dragged.isRoot && dragged.id === target.id) return;

    const newParentId = target.isRoot ? null : (target.id as number);
    if (dragged.parentId === newParentId) return;

    const prevParentId = dragged.parentId;
    this.departments = this.departments.map(d =>
      d.id === dragged.id ? { ...d, parent_department_id: newParentId } : d
    );
    this.visibleNodes = this.buildFlatList(this.departments);

    this.departmentService.moveDepartment(dragged.id as number, {
      new_parent_department_id: newParentId,
    }).subscribe({
      error: err => {
        this.departments = this.departments.map(d =>
          d.id === dragged.id ? { ...d, parent_department_id: prevParentId } : d
        );
        this.visibleNodes = this.buildFlatList(this.departments);
        this.actionError = err?.error?.detail ?? 'Failed to move department.';
      },
    });
  }
}
