import { Component, inject } from '@angular/core';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [],
  template: `
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, <strong>{{ currentUser?.name }}</strong></p>
      <p class="org-info">Organization ID: {{ currentUser?.organization_id }} &middot; Role: {{ currentUser?.role }}</p>
    </div>
  `,
  styles: [`
    h1 { margin: 0 0 0.5rem; color: #1e293b; }
    .org-info { color: #64748b; font-size: 0.875rem; }
  `],
})
export class DashboardComponent {
  private readonly authService = inject(AuthService);

  get currentUser() {
    return this.authService.currentUser;
  }
}
