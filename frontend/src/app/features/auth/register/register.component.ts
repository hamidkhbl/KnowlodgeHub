import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <h1>KnowledgeHub</h1>
        <h2>Register your organization</h2>

        @if (errorMessage) {
          <div class="error-banner" data-testid="register-error">{{ errorMessage }}</div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="organizationName">Organization Name</label>
            <input
              id="organizationName"
              type="text"
              formControlName="organizationName"
              data-testid="register-org-name"
            />
            @if (form.get('organizationName')?.invalid && form.get('organizationName')?.touched) {
              <span class="field-error">Organization name is required</span>
            }
          </div>

          <div class="form-group">
            <label for="organizationSlug">Organization Slug</label>
            <input
              id="organizationSlug"
              type="text"
              formControlName="organizationSlug"
              data-testid="register-org-slug"
              placeholder="e.g. acme"
            />
            @if (form.get('organizationSlug')?.invalid && form.get('organizationSlug')?.touched) {
              <span class="field-error">Slug is required</span>
            }
          </div>

          <div class="form-group">
            <label for="adminName">Your Name</label>
            <input
              id="adminName"
              type="text"
              formControlName="adminName"
              data-testid="register-admin-name"
            />
            @if (form.get('adminName')?.invalid && form.get('adminName')?.touched) {
              <span class="field-error">Name is required</span>
            }
          </div>

          <div class="form-group">
            <label for="adminEmail">Email</label>
            <input
              id="adminEmail"
              type="email"
              formControlName="adminEmail"
              data-testid="register-admin-email"
            />
            @if (form.get('adminEmail')?.invalid && form.get('adminEmail')?.touched) {
              <span class="field-error">Valid email is required</span>
            }
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              data-testid="register-password"
            />
            @if (form.get('password')?.invalid && form.get('password')?.touched) {
              <span class="field-error">Password is required</span>
            }
          </div>

          <button
            type="submit"
            [disabled]="form.invalid || loading"
            data-testid="register-submit"
          >
            {{ loading ? 'Creating...' : 'Create organization' }}
          </button>
        </form>

        <p class="auth-link">
          Already have an account? <a routerLink="/login" data-testid="register-login-link">Sign in</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f1f5f9;
    }
    .auth-card {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 400px;
    }
    h1 { margin: 0 0 0.25rem; font-size: 1.25rem; color: #1e293b; }
    h2 { margin: 0 0 1.5rem; font-size: 1rem; color: #64748b; font-weight: 400; }
    .form-group { margin-bottom: 1rem; }
    label { display: block; margin-bottom: 0.25rem; font-size: 0.875rem; color: #374151; }
    input {
      width: 100%;
      padding: 0.5rem 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-size: 0.875rem;
      box-sizing: border-box;
    }
    input:focus { outline: none; border-color: #3b82f6; }
    .field-error { font-size: 0.75rem; color: #ef4444; margin-top: 0.25rem; display: block; }
    button[type=submit] {
      width: 100%;
      padding: 0.625rem;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 0.875rem;
      cursor: pointer;
      margin-top: 0.5rem;
    }
    button:disabled { background: #93c5fd; cursor: not-allowed; }
    .error-banner {
      background: #fef2f2;
      color: #dc2626;
      border: 1px solid #fecaca;
      padding: 0.75rem;
      border-radius: 4px;
      font-size: 0.875rem;
      margin-bottom: 1rem;
    }
    .auth-link { margin-top: 1rem; font-size: 0.875rem; text-align: center; color: #6b7280; }
    .auth-link a { color: #3b82f6; text-decoration: none; }
  `],
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  form = this.fb.group({
    organizationName: ['', Validators.required],
    organizationSlug: ['', Validators.required],
    adminName: ['', Validators.required],
    adminEmail: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  loading = false;
  errorMessage = '';

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    const value = this.form.value;

    this.authService.register({
      organizationName: value.organizationName!,
      organizationSlug: value.organizationSlug!,
      adminName: value.adminName!,
      adminEmail: value.adminEmail!,
      password: value.password!,
    }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.errorMessage = err.error?.detail ?? 'Registration failed. Please try again.';
        this.loading = false;
      },
    });
  }
}
