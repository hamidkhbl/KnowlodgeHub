import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: string;
  department_id: number | null;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}/users`);
  }

  createUser(request: CreateUserRequest): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/users`, request);
  }
}
