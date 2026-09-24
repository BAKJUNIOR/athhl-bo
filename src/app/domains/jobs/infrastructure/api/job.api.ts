import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { JobOffer, JobUpsertRequest } from '../../domain/entities/job-offer.entity';

/**
 * Endpoints réservés ADMIN — pas encore implémentés côté backend (même situation que
 * ServiceApi, voir son commentaire). Contrat posé à l'avance pour brancher le backend
 * plus tard sans retoucher le front du BO.
 */
@Injectable({ providedIn: 'root' })
export class JobApi {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;
  private readonly ep = environment.endpoints.jobs;

  list(): Observable<JobOffer[]> {
    return this.http.get<JobOffer[]>(`${this.base}/${this.ep.list}`);
  }

  getById(id: number): Observable<JobOffer> {
    return this.http.get<JobOffer>(`${this.base}/${this.ep.byId(id)}`);
  }

  create(payload: JobUpsertRequest): Observable<JobOffer> {
    return this.http.post<JobOffer>(`${this.base}/${this.ep.create}`, payload);
  }

  update(id: number, payload: JobUpsertRequest): Observable<JobOffer> {
    return this.http.patch<JobOffer>(`${this.base}/${this.ep.update(id)}`, payload);
  }

  publish(id: number): Observable<JobOffer> {
    return this.http.post<JobOffer>(`${this.base}/${this.ep.publish(id)}`, {});
  }

  unpublish(id: number): Observable<JobOffer> {
    return this.http.post<JobOffer>(`${this.base}/${this.ep.unpublish(id)}`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${this.ep.byId(id)}`);
  }
}
