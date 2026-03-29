import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { ArticleService, Article } from '../../../core/services/article.service';
import { ArticleFormComponent } from '../article-form/article-form.component';

@Component({
  selector: 'app-article-edit',
  imports: [CommonModule, ArticleFormComponent],
  template: `
    @if (loading) {
      <p class="status-msg" data-testid="article-edit-loading">Loading...</p>
    }
    @if (loadError) {
      <p class="error-msg" data-testid="article-edit-error">{{ loadError }}</p>
    }
    @if (!loading && !loadError && article) {
      <app-article-form [article]="article" />
    }
  `,
  styles: [`
    .status-msg { color: #64748b; padding: 2rem; }
    .error-msg  { color: #dc2626; padding: 2rem; font-size: 0.9rem; }
  `],
})
export class ArticleEditComponent implements OnInit {
  private readonly articleService = inject(ArticleService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  article: Article | null = null;
  loading = true;
  loadError: string | null = null;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.articleService.getArticle(id).subscribe({
      next: article => {
        this.article = article;
        this.loading = false;
      },
      error: err => {
        this.loadError = err?.status === 404 ? 'Article not found.' : 'Failed to load article.';
        this.loading = false;
      },
    });
  }
}
