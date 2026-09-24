import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { TeamMember, TeamMemberUpsertRequest } from '../../domain/entities/team-member.entity';

/** Endpoint réservé ADMIN — pas encore implémenté côté backend (voir domains/services). */
@Injectable({ providedIn: 'root' })
export class TeamApi {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;
  private readonly ep = environment.endpoints.team;

  list(): Observable<TeamMember[]> {
    return this.http.get<TeamMember[]>(`${this.base}/${this.ep.list}`);
  }

  create(payload: TeamMemberUpsertRequest): Observable<TeamMember> {
    return this.http.post<TeamMember>(`${this.base}/${this.ep.create}`, payload);
  }

  update(id: number, payload: TeamMemberUpsertRequest): Observable<TeamMember> {
    return this.http.patch<TeamMember>(`${this.base}/${this.ep.update(id)}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${this.ep.byId(id)}`);
  }
}
