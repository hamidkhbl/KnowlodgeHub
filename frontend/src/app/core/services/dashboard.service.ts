import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

export interface DashboardStats {
  userCount: number | null;
  departmentCount: number;
  articleCount: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);

  getStats(includeUsers: boolean): Observable<DashboardStats> {
    const departments$ = this.http
      .get<unknown[]>(`${environment.apiUrl}/departments`)
      .pipe(map(list => list.length));

    const articles$ = this.http
      .get<unknown[]>(`${environment.apiUrl}/articles`)
      .pipe(map(list => list.length));

    const users$: Observable<number | null> = includeUsers
      ? this.http.get<unknown[]>(`${environment.apiUrl}/users`).pipe(map(list => list.length))
      : of(null);

    return forkJoin([users$, departments$, articles$]).pipe(
      map(([userCount, departmentCount, articleCount]) => ({
        userCount,
        departmentCount,
        articleCount,
      }))
    );
  }
}
