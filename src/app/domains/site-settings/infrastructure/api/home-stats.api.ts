import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { HomeStat } from '../../domain/entities/home-stat.entity';

/**
 * Endpoint réservé ADMIN — pas encore implémenté côté backend (voir domains/services).
 * Jeu de données fixe (3 lignes) : un seul GET, un seul PUT global, pas de create/delete.
 */
@Injectable({ providedIn: 'root' })
export class HomeStatsApi {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;
  private readonly ep = environment.endpoints.homeStats;

  list(): Observable<HomeStat[]> {
    return this.http.get<HomeStat[]>(`${this.base}/${this.ep.list}`);
  }

  update(stats: HomeStat[]): Observable<HomeStat[]> {
    return this.http.put<HomeStat[]>(`${this.base}/${this.ep.update}`, stats);
  }
}
