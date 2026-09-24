import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Project, ProjectUpsertRequest } from '../../domain/entities/project.entity';

/** Endpoint réservé ADMIN — pas encore implémenté côté backend (voir domains/services). */
@Injectable({ providedIn: 'root' })
export class ProjectApi {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;
  private readonly ep = environment.endpoints.projects;

  list(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.base}/${this.ep.list}`);
  }

  create(payload: ProjectUpsertRequest): Observable<Project> {
    return this.http.post<Project>(`${this.base}/${this.ep.create}`, payload);
  }

  update(id: number, payload: ProjectUpsertRequest): Observable<Project> {
    return this.http.patch<Project>(`${this.base}/${this.ep.update(id)}`, payload);
  }

  publish(id: number): Observable<Project> {
    return this.http.post<Project>(`${this.base}/${this.ep.publish(id)}`, {});
  }

  unpublish(id: number): Observable<Project> {
    return this.http.post<Project>(`${this.base}/${this.ep.unpublish(id)}`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${this.ep.byId(id)}`);
  }
}
