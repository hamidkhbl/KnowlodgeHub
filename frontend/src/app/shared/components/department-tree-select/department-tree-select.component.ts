import {
  Component,
  Input,
  forwardRef,
  HostListener,
  ElementRef,
  inject,
  OnChanges,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { Department } from '../../../core/services/department.service';

interface TreeNode {
  id: number | null;
  name: string;
  depth: number;
  isRoot: boolean;
  hasChildren: boolean;
  expanded: boolean;
}

@Component({
  selector: 'app-department-tree-select',
  standalone: true,
  imports: [],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DepartmentTreeSelectComponent),
      multi: true,
    },
  ],
  template: `
    <div
      class="dts-wrap"
      data-testid="department-tree-select"
      [class.dts-open]="isOpen"
      [class.dts-disabled]="isDisabled"
    >
      <!-- Trigger -->
      <button
        type="button"
        class="dts-trigger"
        (click)="toggleOpen()"
        [disabled]="isDisabled"
        [attr.aria-expanded]="isOpen"
        aria-haspopup="listbox"
      >
        <span
          class="dts-label"
          [class.dts-placeholder]="isPlaceholder"
          data-testid="department-tree-selected-path"
        >{{ triggerLabel }}</span>
        <svg
          class="dts-chevron"
          [class.dts-rotated]="isOpen"
          viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      <!-- Inline tree panel (document-flow to avoid dialog overflow clipping) -->
      @if (isOpen) {
        <div class="dts-panel" role="listbox">

          <!-- "None" option — only shown when root is non-selectable -->
          @if (!allowRoot) {
            <div
              class="dts-option dts-none"
              [class.dts-selected]="value === null"
              (click)="selectValue(null)"
              data-testid="department-tree-option"
              role="option"
              [attr.aria-selected]="value === null"
            >
              <span class="dts-spacer"></span>
              <span class="dts-node-name">{{ placeholder }}</span>
            </div>
          }

          @for (node of visibleNodes; track trackBy(node)) {
            <div
              class="dts-option"
              [class.dts-root]="node.isRoot"
              [class.dts-selected]="isSelected(node)"
              [class.dts-non-selectable]="node.isRoot && !allowRoot"
              [style.padding-left.px]="node.depth * 16"
              data-testid="department-tree-option"
              role="option"
              [attr.aria-selected]="isSelected(node)"
            >
              @if (node.hasChildren) {
                <button
                  type="button"
                  class="dts-expand"
                  (click)="$event.stopPropagation(); toggleExpand(node)"
                  data-testid="department-tree-expand"
                  [attr.aria-expanded]="node.expanded"
                  [attr.aria-label]="(node.expanded ? 'Collapse ' : 'Expand ') + node.name"
                >{{ node.expanded ? '▾' : '▸' }}</button>
              } @else {
                <span class="dts-spacer"></span>
              }

              <span
                class="dts-node-name"
                [class.dts-selectable]="!node.isRoot || allowRoot"
                (click)="onNodeClick(node)"
              >
                {{ node.name }}
                @if (node.isRoot) {
                  <span class="dts-org-badge">Org</span>
                }
              </span>
            </div>
          }

        </div>
      }
    </div>
  `,
  styles: [`
    .dts-wrap {
      position: relative;
      display: block;
    }

    /* ── Trigger ────────────────────────────────────────────────────────────── */
    .dts-trigger {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 0.5rem 0.75rem;
      background: #fff;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-family: inherit;
      font-size: 0.875rem;
      color: #1e293b;
      cursor: pointer;
      text-align: left;
      transition: border-color 0.15s, box-shadow 0.15s;
      box-sizing: border-box;
      line-height: 1.4;
    }
    .dts-trigger:hover:not(:disabled) { border-color: #9ca3af; }
    .dts-open .dts-trigger {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px #bfdbfe;
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }
    .dts-trigger:disabled {
      opacity: 0.55;
      cursor: not-allowed;
      background: #f9fafb;
    }

    .dts-label {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .dts-label.dts-placeholder { color: #9ca3af; }

    .dts-chevron {
      width: 14px;
      height: 14px;
      color: #9ca3af;
      flex-shrink: 0;
      margin-left: 0.5rem;
      transition: transform 0.15s;
    }
    .dts-chevron.dts-rotated { transform: rotate(180deg); }

    /* ── Panel ──────────────────────────────────────────────────────────────── */
    .dts-panel {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: #fff;
      border: 1px solid #3b82f6;
      border-top: none;
      border-radius: 0 0 6px 6px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.12);
      max-height: 240px;
      overflow-y: auto;
      z-index: 100;
    }

    /* ── Options ────────────────────────────────────────────────────────────── */
    .dts-option {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.375rem 0.5rem;
      font-size: 0.875rem;
      border-bottom: 1px solid #f1f5f9;
      cursor: default;
      user-select: none;
    }
    .dts-option:last-child { border-bottom: none; }
    .dts-option.dts-root { background: #f8fafc; }
    .dts-option.dts-none { color: #94a3b8; }
    .dts-option.dts-none:hover { background: #f1f5f9; cursor: pointer; }
    .dts-option.dts-selected { background: #eff6ff; }
    .dts-option.dts-selected .dts-node-name { color: #2563eb; font-weight: 500; }

    /* ── Expand button ──────────────────────────────────────────────────────── */
    .dts-expand {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: 1.25rem;
      height: 1.25rem;
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
      color: #64748b;
      font-size: 0.7rem;
    }
    .dts-expand:hover { color: #2563eb; }

    .dts-spacer {
      display: inline-block;
      flex-shrink: 0;
      width: 1.25rem;
    }

    /* ── Node label ─────────────────────────────────────────────────────────── */
    .dts-node-name {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      flex: 1;
      color: #1e293b;
    }
    .dts-node-name.dts-selectable { cursor: pointer; }
    .dts-node-name.dts-selectable:hover { color: #2563eb; }

    .dts-org-badge {
      font-size: 0.65rem;
      font-weight: 500;
      background: #dbeafe;
      color: #1d4ed8;
      padding: 0.05rem 0.35rem;
      border-radius: 999px;
    }
  `],
})
export class DepartmentTreeSelectComponent implements ControlValueAccessor, OnChanges {
  @Input() departments: Department[] = [];
  @Input() orgName = 'Organization';
  @Input() allowRoot = false;
  @Input() placeholder = 'Select department';

  value: number | null = null;
  isOpen = false;
  isDisabled = false;
  visibleNodes: TreeNode[] = [];

  private readonly expandedState = new Map<number | null, boolean>();
  private onChange: (val: number | null) => void = () => {};
  private onTouched: () => void = () => {};
  private readonly el = inject(ElementRef);

  ngOnChanges(): void {
    this.buildVisibleNodes();
  }

  get triggerLabel(): string {
    if (this.value === null) {
      return this.allowRoot ? this.orgName : this.placeholder;
    }
    return this.computePath(this.value) || this.placeholder;
  }

  get isPlaceholder(): boolean {
    return this.value === null && !this.allowRoot;
  }

  isSelected(node: TreeNode): boolean {
    if (node.isRoot) return this.allowRoot && this.value === null;
    return this.value === node.id;
  }

  trackBy(node: TreeNode): string {
    return node.id === null ? 'root' : String(node.id);
  }

  toggleOpen(): void {
    if (this.isDisabled) return;
    this.isOpen = !this.isOpen;
    if (this.isOpen) this.onTouched();
  }

  toggleExpand(node: TreeNode): void {
    const current = this.expandedState.get(node.id) ?? true;
    this.expandedState.set(node.id, !current);
    this.buildVisibleNodes();
  }

  onNodeClick(node: TreeNode): void {
    if (node.isRoot && !this.allowRoot) return;
    this.selectValue(node.isRoot ? null : (node.id as number));
  }

  selectValue(val: number | null): void {
    this.value = val;
    this.onChange(val);
    this.isOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.el.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  // ── ControlValueAccessor ───────────────────────────────────────────────────

  writeValue(val: number | null): void {
    this.value = val ?? null;
  }

  registerOnChange(fn: (val: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  // ── Tree building ──────────────────────────────────────────────────────────

  private computePath(id: number): string {
    const parts: string[] = [];
    let dept = this.departments.find(d => d.id === id);
    while (dept) {
      parts.unshift(dept.name);
      const parentId = dept.parent_department_id;
      dept = parentId !== null ? this.departments.find(d => d.id === parentId) : undefined;
    }
    return parts.join(' > ');
  }

  private buildVisibleNodes(): void {
    const childMap = new Map<number | null, Department[]>();
    for (const d of this.departments) {
      const key = d.parent_department_id;
      if (!childMap.has(key)) childMap.set(key, []);
      childMap.get(key)!.push(d);
    }

    const flat: TreeNode[] = [];
    const rootExpanded = this.expandedState.get(null) ?? true;

    flat.push({
      id: null,
      name: this.orgName,
      depth: 0,
      isRoot: true,
      hasChildren: (childMap.get(null)?.length ?? 0) > 0,
      expanded: rootExpanded,
    });

    if (rootExpanded) {
      const walk = (parentId: number | null, depth: number) => {
        for (const d of childMap.get(parentId) ?? []) {
          const hasChildren = (childMap.get(d.id)?.length ?? 0) > 0;
          const expanded = this.expandedState.get(d.id) ?? true;
          flat.push({ id: d.id, name: d.name, depth, isRoot: false, hasChildren, expanded });
          if (expanded) walk(d.id, depth + 1);
        }
      };
      walk(null, 1);
    }

    this.visibleNodes = flat;
  }
}
