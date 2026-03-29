import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface Department {
  id: number;
  name: string;
  organization_id: number;
}

export interface CreateDepartmentRequest {
  name: string;
}

@Injectable({ providedIn: 'root' })
export class DepartmentService {
  private readonly http = inject(HttpClient);

  getDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(`${environment.apiUrl}/departments`);
  }

  createDepartment(request: CreateDepartmentRequest): Observable<Department> {
    return this.http.post<Department>(`${environment.apiUrl}/departments`, request);
  }
}
