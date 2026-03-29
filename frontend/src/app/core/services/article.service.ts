import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface Article {
  id: number;
  title: string;
  content: string;
  tags: string | null;
  status: 'DRAFT' | 'PUBLISHED';
  department_id: number | null;
  author_id: number;
  author_name: string;
  organization_id: number;
  created_at: string;
  updated_at: string;
  like_count: number;
  liked_by_current_user: boolean;
}

export interface ArticleFilters {
  q?: string;
  status?: string;
  department_id?: number;
}

export interface CreateArticleRequest {
  title: string;
  content: string;
  tags: string | null;
  status: 'DRAFT' | 'PUBLISHED';
  department_id: number | null;
}

@Injectable({ providedIn: 'root' })
export class ArticleService {
  private readonly http = inject(HttpClient);

  getArticles(filters: ArticleFilters = {}): Observable<Article[]> {
    let params = new HttpParams();
    if (filters.q) params = params.set('q', filters.q);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.department_id != null) params = params.set('department_id', String(filters.department_id));
    return this.http.get<Article[]>(`${environment.apiUrl}/articles`, { params });
  }

  getArticle(id: number): Observable<Article> {
    return this.http.get<Article>(`${environment.apiUrl}/articles/${id}`);
  }

  createArticle(request: CreateArticleRequest): Observable<Article> {
    return this.http.post<Article>(`${environment.apiUrl}/articles`, request);
  }

  updateArticle(id: number, request: CreateArticleRequest): Observable<Article> {
    return this.http.put<Article>(`${environment.apiUrl}/articles/${id}`, request);
  }

  deleteArticle(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${environment.apiUrl}/articles/${id}`);
  }
}
