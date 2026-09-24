import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { RegisterUserRequest, UserSummary } from '../../domain/entities/user.entity';

/**
 * Endpoints réservés ADMIN (voir docs/API-GESTION-UTILISATEURS.md §6/§8).
 * `GET /users` renvoie un tableau simple, sans pagination (§3.3) : le filtrage/la
 * recherche se font donc côté front sur la liste complète.
 */
@Injectable({ providedIn: 'root' })
export class UserApi {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;
  private readonly ep = environment.endpoints.users;

  list(): Observable<UserSummary[]> {
    return this.http.get<UserSummary[]>(`${this.base}/${this.ep.list}`);
  }

  register(payload: RegisterUserRequest): Observable<unknown> {
    return this.http.post(`${this.base}/${this.ep.register}`, payload);
  }

  // Le backend renvoie du texte brut (ResponseEntity<String>, pas de JSON) sur ces 4 endpoints.
  block(userId: number): Observable<string> {
    return this.http.post(`${this.base}/${this.ep.block(userId)}`, {}, { responseType: 'text' });
  }

  unblock(userId: number): Observable<string> {
    return this.http.post(`${this.base}/${this.ep.unblock(userId)}`, {}, { responseType: 'text' });
  }

  resetPassword(userId: number): Observable<string> {
    return this.http.post(`${this.base}/${this.ep.resetPassword(userId)}`, {}, { responseType: 'text' });
  }

  delete(userId: number): Observable<string> {
    return this.http.delete(`${this.base}/${this.ep.byId(userId)}`, { responseType: 'text' });
  }
}
