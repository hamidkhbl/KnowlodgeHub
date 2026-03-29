import { Component, Input, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';

import { CommentService, Comment } from '../../../core/services/comment.service';
import { AuthService } from '../../../core/services/auth.service';
import { LikeService } from '../../../core/services/like.service';

const PREVIEW_COUNT = 3;

@Component({
  selector: 'app-article-comments',
  imports: [DatePipe, ReactiveFormsModule],
  template: `
    <section class="comments-section" data-testid="article-comments-section">
      <h2 class="comments-heading">
        Comments
        @if (comments.length > 0) {
          <span class="comments-count">{{ comments.length }}</span>
        }
      </h2>

      @if (loadError) {
        <p class="error-msg" data-testid="comments-error">{{ loadError }}</p>
      }

      @if (loading) {
        <p class="status-msg" data-testid="comments-loading">Loading comments...</p>
      }

      @if (!loading && !loadError) {

        @if (comments.length === 0) {
          <p class="empty-msg">No comments yet. Be the first to comment.</p>
        }

        <!-- Comment list -->
        <div class="comment-list">
          @for (comment of visibleComments; track comment.id) {
            <div class="comment-item" data-testid="comment-item">
              <div class="comment-avatar" aria-hidden="true">{{ initial(comment.author_name) }}</div>
              <div class="comment-body-wrap">
                <div class="comment-meta">
                  <span class="comment-author" data-testid="comment-author">{{ comment.author_name }}</span>
                  <span class="comment-date" data-testid="comment-date">{{ comment.created_at | date:'MMM d, y, h:mm a' }}</span>
                  @if (canDelete(comment)) {
                    <button
                      class="comment-delete"
                      (click)="onDelete(comment)"
                      [disabled]="deletingId === comment.id"
                      data-testid="comment-delete-button"
                      title="Delete comment"
                      aria-label="Delete comment"
                    >✕</button>
                  }
                </div>
                <p class="comment-text" data-testid="comment-body">{{ comment.body }}</p>
                <div class="comment-footer">
                  <button
                    class="comment-like-btn"
                    [class.liked]="comment.liked_by_current_user"
                    [disabled]="likingCommentId === comment.id"
                    (click)="onLikeComment(comment)"
                    data-testid="comment-like-button"
                    [attr.aria-label]="comment.liked_by_current_user ? 'Unlike' : 'Like'"
                  >
                    <svg class="like-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/>
                    </svg>
                    <span data-testid="comment-like-count">{{ comment.like_count }}</span>
                  </button>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Show all / collapse toggle -->
        @if (comments.length > PREVIEW_COUNT) {
          <button class="show-toggle" (click)="showAll = !showAll" data-testid="comments-show-toggle">
            @if (showAll) {
              Show fewer comments
            } @else {
              Show all {{ comments.length }} comments
            }
          </button>
        }

        @if (actionError) {
          <p class="error-msg" data-testid="comments-action-error">{{ actionError }}</p>
        }

        <!-- New comment form -->
        <div class="comment-form">
          <div class="comment-avatar self-avatar" aria-hidden="true">{{ selfInitial }}</div>
          <div class="comment-form-inner">
            <textarea
              [formControl]="bodyControl"
              placeholder="Write a comment..."
              rows="3"
              data-testid="comment-input"
              (keydown.meta.enter)="onSubmit()"
              (keydown.ctrl.enter)="onSubmit()"
            ></textarea>
            <div class="form-actions">
              <button
                type="button"
                class="btn-submit"
                (click)="onSubmit()"
                [disabled]="bodyControl.invalid || submitting"
                data-testid="comment-submit"
              >{{ submitting ? 'Posting...' : 'Post Comment' }}</button>
            </div>
          </div>
        </div>

      }
    </section>
  `,
  styles: [`
    .comments-section {
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e2e8f0;
    }

    .comments-heading {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 1.25rem;
    }
    .comments-count {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 1.25rem;
      height: 1.25rem;
      padding: 0 0.3rem;
      background: #e2e8f0;
      color: #475569;
      border-radius: 999px;
      font-size: 0.7rem;
      font-weight: 600;
    }

    /* ── Comment list ───────────────────────────────────────────────────────── */
    .comment-list { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 0.75rem; }

    .comment-item {
      display: flex;
      gap: 0.75rem;
    }

    .comment-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #2563eb;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 600;
      flex-shrink: 0;
    }
    .self-avatar { background: #0f172a; }

    .comment-body-wrap { flex: 1; min-width: 0; }

    .comment-meta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.25rem;
    }
    .comment-author {
      font-size: 0.8125rem;
      font-weight: 600;
      color: #1e293b;
    }
    .comment-date {
      font-size: 0.75rem;
      color: #94a3b8;
    }
    .comment-delete {
      margin-left: auto;
      background: none;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      color: #94a3b8;
      font-size: 0.7rem;
      cursor: pointer;
      padding: 0.2rem 0.45rem;
      line-height: 1;
      opacity: 0;
      transition: opacity 0.1s, color 0.1s, background 0.1s, border-color 0.1s;
    }
    .comment-item:hover .comment-delete { opacity: 1; }
    .comment-delete:hover:not(:disabled) { color: #dc2626; background: #fee2e2; border-color: #fca5a5; }
    .comment-delete:disabled { opacity: 0.4; cursor: not-allowed; }

    .comment-text {
      margin: 0;
      font-size: 0.875rem;
      color: #374151;
      line-height: 1.6;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .comment-footer { margin-top: 0.375rem; }

    .comment-like-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      background: none;
      border: none;
      color: #94a3b8;
      font-size: 0.75rem;
      font-weight: 500;
      cursor: pointer;
      padding: 0.2rem 0.375rem;
      border-radius: 4px;
      transition: color 0.12s, background 0.12s;
    }
    .comment-like-btn:hover:not(:disabled) { color: #2563eb; background: #eff6ff; }
    .comment-like-btn.liked { color: #2563eb; }
    .comment-like-btn.liked .like-icon { fill: #2563eb; stroke: #2563eb; }
    .comment-like-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .like-icon { width: 13px; height: 13px; flex-shrink: 0; }

    /* ── Show toggle ────────────────────────────────────────────────────────── */
    .show-toggle {
      display: block;
      background: none;
      border: none;
      color: #2563eb;
      font-size: 0.8125rem;
      font-weight: 500;
      cursor: pointer;
      padding: 0.25rem 0;
      margin-bottom: 1rem;
    }
    .show-toggle:hover { text-decoration: underline; }

    /* ── Comment form ───────────────────────────────────────────────────────── */
    .comment-form {
      display: flex;
      gap: 0.75rem;
      margin-top: 1.25rem;
      padding-top: 1rem;
      border-top: 1px solid #f1f5f9;
    }
    .comment-form-inner { flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
    textarea {
      width: 100%;
      padding: 0.5rem 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-family: inherit;
      font-size: 0.875rem;
      color: #1e293b;
      resize: vertical;
      box-sizing: border-box;
      transition: border-color 0.15s, box-shadow 0.15s;
      outline: none;
    }
    textarea:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px #bfdbfe;
    }
    textarea::placeholder { color: #9ca3af; }

    .form-actions { display: flex; justify-content: flex-end; }
    .btn-submit {
      padding: 0.4rem 1rem;
      background: #2563eb;
      color: #fff;
      border: none;
      border-radius: 4px;
      font-family: inherit;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.15s;
    }
    .btn-submit:hover:not(:disabled) { background: #1d4ed8; }
    .btn-submit:disabled { opacity: 0.55; cursor: not-allowed; }

    .empty-msg { color: #94a3b8; font-size: 0.875rem; margin: 0 0 1rem; }
    .status-msg { color: #64748b; font-size: 0.875rem; }
    .error-msg { color: #dc2626; font-size: 0.875rem; margin: 0.5rem 0; }
  `],
})
export class ArticleCommentsComponent implements OnInit {
  @Input({ required: true }) articleId!: number;

  private readonly commentService = inject(CommentService);
  private readonly authService = inject(AuthService);
  private readonly likeService = inject(LikeService);

  readonly PREVIEW_COUNT = PREVIEW_COUNT;

  comments: Comment[] = [];
  loading = true;
  loadError: string | null = null;
  actionError: string | null = null;
  showAll = false;
  submitting = false;
  deletingId: number | null = null;

  bodyControl = new FormControl('', [Validators.required, Validators.maxLength(2000)]);
  likingCommentId: number | null = null;

  get visibleComments(): Comment[] {
    return this.showAll ? this.comments : this.comments.slice(0, PREVIEW_COUNT);
  }

  get selfInitial(): string {
    return (this.authService.currentUser?.name ?? '?')[0].toUpperCase();
  }

  ngOnInit(): void {
    this.commentService.getComments(this.articleId).subscribe({
      next: comments => {
        this.comments = comments;
        this.loading = false;
      },
      error: () => {
        this.loadError = 'Failed to load comments.';
        this.loading = false;
      },
    });
  }

  canDelete(comment: Comment): boolean {
    const user = this.authService.currentUser;
    if (!user) return false;
    if (user.role === 'ORG_ADMIN' || user.role === 'MANAGER') return true;
    return comment.author_id === user.id;
  }

  onSubmit(): void {
    const body = this.bodyControl.value?.trim() ?? '';
    if (!body || this.submitting) return;

    this.submitting = true;
    this.actionError = null;

    this.commentService.createComment(this.articleId, { body }).subscribe({
      next: comment => {
        this.comments = [...this.comments, comment];
        this.bodyControl.reset('');
        this.submitting = false;
        // Expand to show the new comment if it would be hidden
        if (this.comments.length > PREVIEW_COUNT) this.showAll = true;
      },
      error: () => {
        this.actionError = 'Failed to post comment. Please try again.';
        this.submitting = false;
      },
    });
  }

  onDelete(comment: Comment): void {
    this.deletingId = comment.id;
    this.actionError = null;

    this.commentService.deleteComment(this.articleId, comment.id).subscribe({
      next: () => {
        this.comments = this.comments.filter(c => c.id !== comment.id);
        this.deletingId = null;
        // Collapse back to preview if count drops to or below threshold
        if (this.comments.length <= PREVIEW_COUNT) this.showAll = false;
      },
      error: () => {
        this.actionError = 'Failed to delete comment.';
        this.deletingId = null;
      },
    });
  }

  onLikeComment(comment: Comment): void {
    if (this.likingCommentId === comment.id) return;
    this.likingCommentId = comment.id;
    const action = comment.liked_by_current_user
      ? this.likeService.unlikeComment(comment.id)
      : this.likeService.likeComment(comment.id);

    action.subscribe({
      next: summary => {
        comment.liked_by_current_user = summary.liked;
        comment.like_count = summary.like_count;
        this.likingCommentId = null;
      },
      error: () => { this.likingCommentId = null; },
    });
  }

  initial(name: string): string {
    return (name ?? '?')[0].toUpperCase();
  }
}
