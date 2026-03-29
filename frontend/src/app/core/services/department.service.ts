import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface Department {
  id: number;
  name: string;
  organization_id: number;
  parent_department_id: number | null;
}

export interface CreateDepartmentRequest {
  name: string;
  parent_department_id: number | null;
}

export interface MoveDepartmentRequest {
  new_parent_department_id: number | null;
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

  deleteDepartment(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/departments/${id}`);
  }

  moveDepartment(id: number, request: MoveDepartmentRequest): Observable<Department> {
    return this.http.patch<Department>(`${environment.apiUrl}/departments/${id}/move`, request);
  }
}
