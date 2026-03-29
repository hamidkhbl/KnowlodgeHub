import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">

        <div class="auth-brand">
          <svg class="auth-brand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
          <span class="auth-brand-name">KnowledgeHub</span>
        </div>

        <div class="auth-header">
          <h1>Welcome back</h1>
          <p>Sign in to your organization</p>
        </div>

        @if (errorMessage) {
          <div class="error-banner" data-testid="login-error">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {{ errorMessage }}
          </div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-field">
            <label for="email">Email address</label>
            <input id="email" type="email" formControlName="email" data-testid="login-email" placeholder="you@company.com" autocomplete="email"/>
            @if (form.get('email')?.invalid && form.get('email')?.touched) {
              <span class="field-error">Valid email is required</span>
            }
          </div>

          <div class="form-field">
            <label for="password">Password</label>
            <input id="password" type="password" formControlName="password" data-testid="login-password" autocomplete="current-password"/>
            @if (form.get('password')?.invalid && form.get('password')?.touched) {
              <span class="field-error">Password is required</span>
            }
          </div>

          <button type="submit" class="btn-submit" [disabled]="form.invalid || loading" data-testid="login-submit">
            @if (loading) {
              <span class="btn-spinner"></span> Signing in…
            } @else {
              Sign in
            }
          </button>
        </form>

        <p class="auth-footer">
          New organization? <a routerLink="/register" data-testid="login-register-link">Create an account</a>
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
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      padding: 1.5rem;
    }
    .auth-card {
      background: #fff;
      padding: 2.25rem 2rem;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06);
      width: 100%;
      max-width: 400px;
    }

    .auth-brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1.75rem;
    }
    .auth-brand-icon { width: 22px; height: 22px; color: #2563eb; }
    .auth-brand-name { font-size: 0.9375rem; font-weight: 700; color: #0f172a; }

    .auth-header { margin-bottom: 1.5rem; }
    .auth-header h1 { font-size: 1.3125rem; font-weight: 700; color: #0f172a; margin-bottom: 0.25rem; }
    .auth-header p { font-size: 0.875rem; color: #64748b; margin: 0; }

    .auth-form { display: flex; flex-direction: column; gap: 1rem; }

    .form-field { display: flex; flex-direction: column; gap: 0.3rem; }
    label { font-size: 0.8125rem; font-weight: 500; color: #374151; }
    .field-error { font-size: 0.75rem; color: #dc2626; }

    .btn-submit {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 100%;
      padding: 0.625rem 1rem;
      background: #2563eb;
      color: #fff;
      border: none;
      border-radius: 6px;
      font-family: inherit;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      margin-top: 0.25rem;
      transition: background 0.15s;
    }
    .btn-submit:hover:not(:disabled) { background: #1d4ed8; }
    .btn-submit:disabled { opacity: 0.55; cursor: not-allowed; }

    .btn-spinner {
      width: 14px; height: 14px;
      border: 2px solid rgba(255,255,255,0.35);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .error-banner {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: #fef2f2;
      color: #dc2626;
      border: 1px solid #fecaca;
      border-radius: 6px;
      padding: 0.625rem 0.75rem;
      font-size: 0.8125rem;
      margin-bottom: 0.5rem;
    }

    .auth-footer {
      text-align: center;
      font-size: 0.8125rem;
      color: #64748b;
      margin: 1.25rem 0 0;
    }
    .auth-footer a { color: #2563eb; font-weight: 500; }
    .auth-footer a:hover { text-decoration: underline; }
  `],
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  loading = false;
  errorMessage = '';

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMessage = '';
    const { email, password } = this.form.value;
    this.authService.login({ email: email!, password: password! }).subscribe({
      next: () => this.router.navigate(['/feed']),
      error: err => {
        this.errorMessage = err.error?.detail ?? 'Login failed. Please try again.';
        this.loading = false;
      },
    });
  }
}
