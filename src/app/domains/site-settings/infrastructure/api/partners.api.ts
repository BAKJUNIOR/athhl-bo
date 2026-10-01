import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { PartnersSection } from '../../domain/entities/partners.entity';

/**
 * Jeu de données fixe (1 enregistrement) : un seul GET public, un seul PUT réservé ADMIN.
 */
@Injectable({ providedIn: 'root' })
export class PartnersApi {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;
  private readonly ep = environment.endpoints.partners;

  get(): Observable<PartnersSection> {
    return this.http.get<PartnersSection>(`${this.base}/${this.ep.get}`);
  }

  update(section: PartnersSection): Observable<PartnersSection> {
    return this.http.put<PartnersSection>(`${this.base}/${this.ep.update}`, section);
  }
}
