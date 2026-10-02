import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { HomePageContent } from '../../domain/entities/home-page.entity';

/** Jeu de données fixe (1 enregistrement) : un seul GET, un seul PUT global. */
@Injectable({ providedIn: 'root' })
export class HomePageApi {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;
  private readonly ep = environment.endpoints.homePage;

  get(): Observable<HomePageContent> {
    return this.http.get<HomePageContent>(`${this.base}/${this.ep.get}`);
  }

  update(content: HomePageContent): Observable<HomePageContent> {
    return this.http.put<HomePageContent>(`${this.base}/${this.ep.update}`, content);
  }
}
