import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Service, ServiceUpsertRequest } from '../../domain/entities/service.entity';

/**
 * Endpoints réservés ADMIN — pas encore implémentés côté backend (voir le commentaire
 * dans environment.ts). Cette classe pose le contrat attendu par le BO pour que
 * l'intégration se limite à brancher le backend une fois prêt, sans retoucher le front.
 */
@Injectable({ providedIn: 'root' })
export class ServiceApi {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;
  private readonly ep = environment.endpoints.services;

  list(): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.base}/${this.ep.list}`);
  }

  getById(id: number): Observable<Service> {
    return this.http.get<Service>(`${this.base}/${this.ep.byId(id)}`);
  }

  create(payload: ServiceUpsertRequest): Observable<Service> {
    return this.http.post<Service>(`${this.base}/${this.ep.create}`, payload);
  }

  update(id: number, payload: ServiceUpsertRequest): Observable<Service> {
    return this.http.patch<Service>(`${this.base}/${this.ep.update(id)}`, payload);
  }

  publish(id: number): Observable<Service> {
    return this.http.post<Service>(`${this.base}/${this.ep.publish(id)}`, {});
  }

  unpublish(id: number): Observable<Service> {
    return this.http.post<Service>(`${this.base}/${this.ep.unpublish(id)}`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${this.ep.byId(id)}`);
  }
}
