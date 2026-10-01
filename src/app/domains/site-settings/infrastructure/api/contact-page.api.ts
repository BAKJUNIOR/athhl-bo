import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ContactPageContent } from '../../domain/entities/contact-page.entity';

/**
 * Jeu de données fixe (1 enregistrement) : un seul GET public, un seul PUT réservé ADMIN.
 */
@Injectable({ providedIn: 'root' })
export class ContactPageApi {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;
  private readonly ep = environment.endpoints.contactPage;

  get(): Observable<ContactPageContent> {
    return this.http.get<ContactPageContent>(`${this.base}/${this.ep.get}`);
  }

  update(content: ContactPageContent): Observable<ContactPageContent> {
    return this.http.put<ContactPageContent>(`${this.base}/${this.ep.update}`, content);
  }
}
