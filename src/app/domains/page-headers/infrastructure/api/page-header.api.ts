import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { PageHeader } from '../../domain/entities/page-header.entity';

/** Liste fixe (une ligne par page) : un seul GET, un seul PUT global. */
@Injectable({ providedIn: 'root' })
export class PageHeaderApi {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;
  private readonly ep = environment.endpoints.pageHeaders;

  list(): Observable<PageHeader[]> {
    return this.http.get<PageHeader[]>(`${this.base}/${this.ep.get}`);
  }

  update(headers: PageHeader[]): Observable<PageHeader[]> {
    return this.http.put<PageHeader[]>(`${this.base}/${this.ep.update}`, headers);
  }
}
