import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrganizationService, OrgInfo } from '../../core/services/organization.service';

@Component({
  selector: 'app-settings',
  imports: [CommonModule],
  template: `
    <div class="page">
      <h1 class="page-title" data-testid="settings-title">Settings</h1>

      @if (loading) {
        <p class="status-msg">Loading...</p>
      }

      @if (!loading && org) {
        <section class="settings-section">
          <h2 class="section-heading">Organization</h2>

          <div class="org-name-row">
            <span class="org-name-label">Name</span>
            <span class="org-name-value" data-testid="settings-org-name">{{ org.name }}</span>
          </div>

          <div class="logo-row">
            <span class="logo-label">Logo</span>
            <div class="logo-controls">
              @if (org.logo) {
                <div class="logo-preview-wrap">
                  <img
                    [src]="org.logo"
                    alt="Organization logo"
                    class="logo-preview"
                    data-testid="settings-logo-preview"
                  />
                  <button
                    class="btn-remove-logo"
                    (click)="removeLogo()"
                    [disabled]="saving"
                    data-testid="settings-remove-logo"
                  >Remove</button>
                </div>
              }
              <label class="btn-upload" [class.disabled]="saving" data-testid="settings-upload-logo">
                {{ saving ? 'Saving...' : (org.logo ? 'Change Logo' : 'Upload Logo') }}
                <input
                  type="file"
                  accept="image/*"
                  (change)="onFileChange($event)"
                  [disabled]="saving"
                  data-testid="settings-logo-input"
                  hidden
                />
              </label>
            </div>
          </div>

          @if (error) {
            <p class="error-msg" data-testid="settings-error">{{ error }}</p>
          }
          @if (successMsg) {
            <p class="success-msg" data-testid="settings-success">{{ successMsg }}</p>
          }
        </section>
      }
    </div>
  `,
  styles: [`
    .page { max-width: 600px; }
    .page-title { font-size: 1.25rem; font-weight: 600; color: #1e293b; margin: 0 0 1.5rem; }

    .settings-section {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 1.5rem;
    }
    .section-heading {
      font-size: 0.9375rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 1.25rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #f1f5f9;
    }

    .org-name-row, .logo-row {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 0.75rem 0;
      border-bottom: 1px solid #f8fafc;
    }
    .org-name-label, .logo-label {
      width: 100px;
      flex-shrink: 0;
      font-size: 0.875rem;
      font-weight: 500;
      color: #64748b;
      padding-top: 0.1rem;
    }
    .org-name-value {
      font-size: 0.875rem;
      color: #1e293b;
      font-weight: 500;
    }

    .logo-controls { display: flex; flex-direction: column; gap: 0.75rem; }

    .logo-preview-wrap {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .logo-preview {
      width: 64px;
      height: 64px;
      object-fit: contain;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      background: #f8fafc;
    }

    .btn-upload {
      display: inline-block;
      padding: 0.4rem 1rem;
      background: #f1f5f9;
      color: #374151;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.15s;
    }
    .btn-upload:hover:not(.disabled) { background: #e2e8f0; }
    .btn-upload.disabled { opacity: 0.6; cursor: not-allowed; }

    .btn-remove-logo {
      background: none;
      border: none;
      color: #dc2626;
      font-size: 0.8125rem;
      cursor: pointer;
      padding: 0;
      text-decoration: underline;
    }
    .btn-remove-logo:disabled { opacity: 0.5; cursor: not-allowed; }

    .status-msg { color: #64748b; font-size: 0.875rem; }
    .error-msg { color: #dc2626; font-size: 0.875rem; margin: 0.75rem 0 0; }
    .success-msg { color: #166534; font-size: 0.875rem; margin: 0.75rem 0 0; }
  `],
})
export class SettingsComponent implements OnInit {
  private readonly orgService = inject(OrganizationService);

  org: OrgInfo | null = null;
  loading = true;
  saving = false;
  error: string | null = null;
  successMsg: string | null = null;

  ngOnInit(): void {
    this.orgService.loadMyOrg().subscribe({
      next: org => {
        this.org = org;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'Failed to load organization info.';
      },
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      this.uploadLogo(base64);
    };
    reader.readAsDataURL(file);
    // reset so same file can be re-selected
    input.value = '';
  }

  removeLogo(): void {
    this.uploadLogo(null);
  }

  private uploadLogo(logo: string | null): void {
    this.saving = true;
    this.error = null;
    this.successMsg = null;

    this.orgService.updateLogo(logo).subscribe({
      next: org => {
        this.org = org;
        this.saving = false;
        this.successMsg = 'Logo updated successfully.';
        setTimeout(() => (this.successMsg = null), 3000);
      },
      error: () => {
        this.saving = false;
        this.error = 'Failed to update logo. Please try again.';
      },
    });
  }
}
