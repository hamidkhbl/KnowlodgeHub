import { Component } from '@angular/core';

import { ArticleFormComponent } from '../article-form/article-form.component';

@Component({
  selector: 'app-article-create',
  imports: [ArticleFormComponent],
  template: `<app-article-form />`,
})
export class ArticleCreateComponent {}
