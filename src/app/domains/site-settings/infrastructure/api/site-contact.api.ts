import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { SiteContact } from '../../domain/entities/site-contact.entity';

/**
 * Endpoint réservé ADMIN — pas encore implémenté côté backend (voir domains/services).
 * Jeu de données fixe (1 enregistrement) : un seul GET, un seul PUT global.
 */
@Injectable({ providedIn: 'root' })
export class SiteContactApi {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;
  private readonly ep = environment.endpoints.siteContact;

  get(): Observable<SiteContact> {
    return this.http.get<SiteContact>(`${this.base}/${this.ep.get}`);
  }

  update(contact: SiteContact): Observable<SiteContact> {
    return this.http.put<SiteContact>(`${this.base}/${this.ep.update}`, contact);
  }
}
