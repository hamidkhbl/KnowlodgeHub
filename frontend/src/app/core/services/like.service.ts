import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface LikeSummary {
  liked: boolean;
  like_count: number;
}

@Injectable({ providedIn: 'root' })
export class LikeService {
  private readonly http = inject(HttpClient);

  likeArticle(articleId: number): Observable<LikeSummary> {
    return this.http.post<LikeSummary>(`${environment.apiUrl}/articles/${articleId}/like`, {});
  }

  unlikeArticle(articleId: number): Observable<LikeSummary> {
    return this.http.delete<LikeSummary>(`${environment.apiUrl}/articles/${articleId}/like`);
  }

  likeComment(commentId: number): Observable<LikeSummary> {
    return this.http.post<LikeSummary>(`${environment.apiUrl}/comments/${commentId}/like`, {});
  }

  unlikeComment(commentId: number): Observable<LikeSummary> {
    return this.http.delete<LikeSummary>(`${environment.apiUrl}/comments/${commentId}/like`);
  }
}
