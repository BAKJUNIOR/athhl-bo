import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { NewsArticle, NewsUpsertRequest } from '../../domain/entities/news.entity';

@Injectable({ providedIn: 'root' })
export class NewsApi {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;
  private readonly ep = environment.endpoints.news;

  list(): Observable<NewsArticle[]> {
    return this.http.get<NewsArticle[]>(`${this.base}/${this.ep.list}`);
  }

  getById(id: number): Observable<NewsArticle> {
    return this.http.get<NewsArticle>(`${this.base}/${this.ep.byId(id)}`);
  }

  create(payload: NewsUpsertRequest): Observable<NewsArticle> {
    return this.http.post<NewsArticle>(`${this.base}/${this.ep.create}`, payload);
  }

  update(id: number, payload: NewsUpsertRequest): Observable<NewsArticle> {
    return this.http.patch<NewsArticle>(`${this.base}/${this.ep.update(id)}`, payload);
  }

  publish(id: number): Observable<NewsArticle> {
    return this.http.post<NewsArticle>(`${this.base}/${this.ep.publish(id)}`, {});
  }

  unpublish(id: number): Observable<NewsArticle> {
    return this.http.post<NewsArticle>(`${this.base}/${this.ep.unpublish(id)}`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${this.ep.byId(id)}`);
  }
}
