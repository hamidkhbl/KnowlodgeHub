import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../core/services/auth.service';
import { DashboardService, DashboardStats } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <h1>Dashboard</h1>
      <p class="welcome">Welcome, <strong>{{ currentUser?.name }}</strong></p>

      @if (loading) {
        <p class="status-msg" data-testid="dashboard-loading">Loading...</p>
      }

      @if (error) {
        <p class="error-msg" data-testid="dashboard-error">{{ error }}</p>
      }

      @if (!loading && !error && stats) {
        <div class="stats-grid">
          @if (isAdmin) {
            <div class="stat-card" data-testid="dashboard-users-card">
              <div class="stat-value" data-testid="dashboard-users-count">{{ stats.userCount }}</div>
              <div class="stat-label">Users</div>
            </div>
          }

          <div class="stat-card" data-testid="dashboard-departments-card">
            <div class="stat-value" data-testid="dashboard-departments-count">{{ stats.departmentCount }}</div>
            <div class="stat-label">Departments</div>
          </div>

          <div class="stat-card" data-testid="dashboard-articles-card">
            <div class="stat-value" data-testid="dashboard-articles-count">{{ stats.articleCount }}</div>
            <div class="stat-label">Articles</div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard {
      max-width: 800px;
    }
    h1 {
      margin: 0 0 0.25rem;
      color: #1e293b;
    }
    .welcome {
      color: #64748b;
      margin: 0 0 2rem;
      font-size: 0.9rem;
    }
    .stats-grid {
      display: flex;
      gap: 1.5rem;
      flex-wrap: wrap;
    }
    .stat-card {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 1.5rem 2rem;
      min-width: 160px;
      text-align: center;
    }
    .stat-value {
      font-size: 2.5rem;
      font-weight: 700;
      color: #1e293b;
      line-height: 1;
    }
    .stat-label {
      margin-top: 0.5rem;
      font-size: 0.875rem;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .status-msg {
      color: #64748b;
    }
    .error-msg {
      color: #dc2626;
    }
  `],
})
export class DashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly dashboardService = inject(DashboardService);

  stats: DashboardStats | null = null;
  loading = true;
  error: string | null = null;

  get currentUser() {
    return this.authService.currentUser;
  }

  get isAdmin(): boolean {
    return this.authService.currentUser?.role === 'ORG_ADMIN';
  }

  ngOnInit(): void {
    this.dashboardService.getStats(this.isAdmin).subscribe({
      next: stats => {
        this.stats = stats;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load dashboard data.';
        this.loading = false;
      },
    });
  }
}
