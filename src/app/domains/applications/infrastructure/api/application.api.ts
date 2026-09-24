import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApplicationStatus, JobApplication } from '../../domain/entities/job-application.entity';

/**
 * Endpoint réservé ADMIN — pas encore implémenté côté backend (même situation que
 * ServiceApi/JobApi). Lecture seule + changement de statut, puisque ce sont des
 * soumissions de visiteurs, pas un contenu que le BO crée.
 */
@Injectable({ providedIn: 'root' })
export class ApplicationApi {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;
  private readonly ep = environment.endpoints.applications;

  list(): Observable<JobApplication[]> {
    return this.http.get<JobApplication[]>(`${this.base}/${this.ep.list}`);
  }

  updateStatus(id: number, status: ApplicationStatus): Observable<JobApplication> {
    return this.http.patch<JobApplication>(`${this.base}/${this.ep.updateStatus(id)}`, { status });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${this.ep.byId(id)}`);
  }
}
