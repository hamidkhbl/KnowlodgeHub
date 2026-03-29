import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { OrganizationService } from '../../core/services/organization.service';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-shell">
      <nav class="sidebar">

        <div class="sidebar-brand">
          @if (org?.logo) {
            <img [src]="org!.logo" alt="logo" class="brand-logo" data-testid="nav-org-logo" />
          } @else {
            <svg class="brand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          }
          <div class="brand-text">
            <span class="brand-app-name" data-testid="nav-app-title">KnowledgeHub</span>
            @if (orgName) {
              <span class="brand-org-name" data-testid="nav-org-name">{{ orgName }}</span>
            }
          </div>
        </div>

        <div class="nav-section">
          <p class="nav-label">Menu</p>
          <ul class="nav-links">
            <li>
              <a routerLink="/feed" routerLinkActive="active" data-testid="nav-feed">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/>
                </svg>
                Feed
              </a>
            </li>
            <li>
              <a routerLink="/dashboard" routerLinkActive="active" data-testid="nav-dashboard">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>
                </svg>
                Dashboard
              </a>
            </li>
            <li>
              <a routerLink="/articles" routerLinkActive="active" data-testid="nav-articles">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>
                </svg>
                Articles
              </a>
            </li>
            @if (isAdmin) {
              <li>
                <a routerLink="/users" routerLinkActive="active" data-testid="nav-users">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  Users
                </a>
              </li>
              <li>
                <a routerLink="/departments" routerLinkActive="active" data-testid="nav-departments">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>
                  </svg>
                  Departments
                </a>
              </li>
              <li>
                <a routerLink="/settings" routerLinkActive="active" data-testid="nav-settings">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                  Settings
                </a>
              </li>
            }
          </ul>
        </div>

        <div class="sidebar-footer">
          <div class="user-card" data-testid="nav-user-info">
            <div class="user-avatar" aria-hidden="true">{{ userInitial }}</div>
            <div class="user-details">
              <span class="user-name" data-testid="nav-user-name">{{ currentUser?.name }}</span>
              <span class="user-role" data-testid="nav-user-role">{{ roleLabel }}</span>
            </div>
          </div>
          <button class="logout-btn" (click)="logout()" data-testid="nav-logout">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign out
          </button>
        </div>

      </nav>

      <main class="main-content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .app-shell { display: flex; height: 100vh; overflow: hidden; }

    .sidebar {
      width: 232px;
      background: #0f172a;
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      overflow-y: auto;
    }

    .sidebar-brand {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      padding: 1.125rem 1rem 1rem;
      color: #f8fafc;
      border-bottom: 1px solid #1e293b;
    }
    .brand-icon { width: 20px; height: 20px; color: #60a5fa; flex-shrink: 0; }
    .brand-logo { width: 28px; height: 28px; object-fit: contain; border-radius: 4px; flex-shrink: 0; }
    .brand-text { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
    .brand-app-name { font-size: 0.9375rem; font-weight: 700; color: #f8fafc; white-space: nowrap; }
    .brand-org-name {
      font-size: 0.6875rem;
      color: #64748b;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .nav-section { padding: 1rem 0.75rem 0.5rem; flex: 1; }
    .nav-label {
      margin: 0 0 0.375rem 0.375rem;
      font-size: 0.6875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #334155;
    }

    .nav-links { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 1px; }
    .nav-links a {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      padding: 0.5rem 0.625rem;
      color: #94a3b8;
      font-size: 0.875rem;
      font-weight: 450;
      border-radius: 6px;
      text-decoration: none;
      transition: background 0.12s, color 0.12s;
    }
    .nav-links a .icon { color: #475569; transition: color 0.12s; flex-shrink: 0; }
    .nav-links a:hover { background: #1e293b; color: #e2e8f0; text-decoration: none; }
    .nav-links a:hover .icon { color: #64748b; }
    .nav-links a.active { background: #172554; color: #93c5fd; }
    .nav-links a.active .icon { color: #60a5fa; }

    .sidebar-footer { padding: 0.75rem; border-top: 1px solid #1e293b; }

    .user-card {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      padding: 0.5rem 0.625rem;
      border-radius: 6px;
      margin-bottom: 0.375rem;
      background: #1e293b;
    }
    .user-avatar {
      width: 28px;
      height: 28px;
      background: #2563eb;
      color: #fff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 600;
      flex-shrink: 0;
    }
    .user-details { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
    .user-name { font-size: 0.8125rem; font-weight: 500; color: #e2e8f0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .user-role { font-size: 0.6875rem; color: #64748b; font-weight: 500; text-transform: uppercase; letter-spacing: 0.04em; }

    .logout-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      width: 100%;
      padding: 0.4375rem 0.625rem;
      background: transparent;
      color: #64748b;
      border: none;
      border-radius: 6px;
      font-family: inherit;
      font-size: 0.8125rem;
      cursor: pointer;
      text-align: left;
      transition: background 0.12s, color 0.12s;
    }
    .logout-btn:hover { background: #1e293b; color: #94a3b8; }
    .logout-btn .icon { color: #475569; }
    .logout-btn:hover .icon { color: #64748b; }

    .main-content {
      flex: 1;
      overflow-y: auto;
      padding: 2rem 2.5rem;
      background: #f8fafc;
    }
  `],
})
export class LayoutComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly orgService = inject(OrganizationService);

  get currentUser() { return this.authService.currentUser; }
  get isAdmin(): boolean { return this.authService.currentUser?.role === 'ORG_ADMIN'; }
  get orgName(): string { return this.authService.currentUser?.organization_name ?? ''; }
  get org() { return this.orgService.org; }

  get userInitial(): string {
    return (this.authService.currentUser?.name ?? '?')[0].toUpperCase();
  }

  get roleLabel(): string {
    const r = this.authService.currentUser?.role;
    if (r === 'ORG_ADMIN') return 'Admin';
    if (r === 'MANAGER')   return 'Manager';
    if (r === 'EMPLOYEE')  return 'Employee';
    return r ?? '';
  }

  ngOnInit(): void {
    this.orgService.loadMyOrg().subscribe();
  }

  logout(): void { this.authService.logout(); }
}
