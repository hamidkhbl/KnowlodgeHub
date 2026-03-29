import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { LayoutComponent } from './shared/layout/layout.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { UsersComponent } from './features/users/users.component';
import { DepartmentsComponent } from './features/departments/departments.component';
import { ArticlesListComponent } from './features/articles/articles-list/articles-list.component';
import { ArticleDetailComponent } from './features/articles/article-detail/article-detail.component';
import { ArticleEditComponent } from './features/articles/article-edit/article-edit.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      {
        path: 'users',
        component: UsersComponent,
        canActivate: [roleGuard(['ORG_ADMIN'])],
      },
      {
        path: 'departments',
        component: DepartmentsComponent,
        canActivate: [roleGuard(['ORG_ADMIN'])],
      },
      { path: 'articles',          component: ArticlesListComponent },
      { path: 'articles/:id',      component: ArticleDetailComponent },
      { path: 'articles/:id/edit', component: ArticleEditComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
