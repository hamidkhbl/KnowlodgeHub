import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface OrgInfo {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
}

@Injectable({ providedIn: 'root' })
export class OrganizationService {
  private readonly http = inject(HttpClient);

  private orgSubject = new BehaviorSubject<OrgInfo | null>(null);
  org$ = this.orgSubject.asObservable();

  get org(): OrgInfo | null {
    return this.orgSubject.value;
  }

  loadMyOrg(): Observable<OrgInfo> {
    return this.http.get<OrgInfo>(`${environment.apiUrl}/organizations/me`).pipe(
      tap(org => this.orgSubject.next(org))
    );
  }

  updateLogo(logo: string | null): Observable<OrgInfo> {
    return this.http.put<OrgInfo>(`${environment.apiUrl}/organizations/me/logo`, { logo }).pipe(
      tap(org => this.orgSubject.next(org))
    );
  }
}
