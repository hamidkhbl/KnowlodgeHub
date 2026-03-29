import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-shell">
      <nav class="sidebar">
        <div class="sidebar-header">
          <span class="app-name">KnowledgeHub</span>
        </div>

        <ul class="nav-links">
          <li>
            <a routerLink="/dashboard" routerLinkActive="active" data-testid="nav-dashboard">
              Dashboard
            </a>
          </li>
          <li>
            <a routerLink="/articles" routerLinkActive="active" data-testid="nav-articles">
              Articles
            </a>
          </li>
          @if (isAdmin) {
            <li>
              <a routerLink="/users" routerLinkActive="active" data-testid="nav-users">
                Users
              </a>
            </li>
            <li>
              <a routerLink="/departments" routerLinkActive="active" data-testid="nav-departments">
                Departments
              </a>
            </li>
          }
        </ul>

        <div class="sidebar-footer">
          <button (click)="logout()" data-testid="nav-logout">Logout</button>
        </div>
      </nav>

      <main class="main-content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .app-shell {
      display: flex;
      height: 100vh;
    }
    .sidebar {
      width: 220px;
      background: #1e293b;
      color: #f1f5f9;
      display: flex;
      flex-direction: column;
      padding: 1rem;
      flex-shrink: 0;
    }
    .sidebar-header {
      padding: 0.5rem 0 1.5rem;
      font-size: 1.1rem;
      font-weight: 600;
    }
    .nav-links {
      list-style: none;
      padding: 0;
      margin: 0;
      flex: 1;
    }
    .nav-links li {
      margin-bottom: 0.25rem;
    }
    .nav-links a {
      display: block;
      padding: 0.5rem 0.75rem;
      color: #cbd5e1;
      text-decoration: none;
      border-radius: 4px;
    }
    .nav-links a:hover, .nav-links a.active {
      background: #334155;
      color: #f1f5f9;
    }
    .sidebar-footer {
      padding-top: 1rem;
      border-top: 1px solid #334155;
    }
    .sidebar-footer button {
      width: 100%;
      padding: 0.5rem;
      background: transparent;
      color: #cbd5e1;
      border: 1px solid #475569;
      border-radius: 4px;
      cursor: pointer;
    }
    .sidebar-footer button:hover {
      background: #334155;
    }
    .main-content {
      flex: 1;
      overflow-y: auto;
      padding: 2rem;
      background: #f8fafc;
    }
  `],
})
export class LayoutComponent {
  private readonly authService = inject(AuthService);

  get isAdmin(): boolean {
    return this.authService.currentUser?.role === 'ORG_ADMIN';
  }

  logout(): void {
    this.authService.logout();
  }
}
