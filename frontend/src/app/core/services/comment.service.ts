import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface Comment {
  id: number;
  article_id: number;
  author_id: number;
  author_name: string;
  body: string;
  created_at: string;
  like_count: number;
  liked_by_current_user: boolean;
}

export interface CreateCommentRequest {
  body: string;
}

@Injectable({ providedIn: 'root' })
export class CommentService {
  private readonly http = inject(HttpClient);

  getComments(articleId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${environment.apiUrl}/articles/${articleId}/comments`);
  }

  createComment(articleId: number, request: CreateCommentRequest): Observable<Comment> {
    return this.http.post<Comment>(`${environment.apiUrl}/articles/${articleId}/comments`, request);
  }

  deleteComment(articleId: number, commentId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/articles/${articleId}/comments/${commentId}`);
  }
}
