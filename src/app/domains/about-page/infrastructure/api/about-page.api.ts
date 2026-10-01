import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { AboutPageContent } from '../../domain/entities/about-page.entity';

/** Jeu de données fixe (1 enregistrement) : un seul GET, un seul PUT global. */
@Injectable({ providedIn: 'root' })
export class AboutPageApi {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;
  private readonly ep = environment.endpoints.aboutPage;

  get(): Observable<AboutPageContent> {
    return this.http.get<AboutPageContent>(`${this.base}/${this.ep.get}`);
  }

  update(content: AboutPageContent): Observable<AboutPageContent> {
    return this.http.put<AboutPageContent>(`${this.base}/${this.ep.update}`, content);
  }
}
