import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface DashboardSummary {
  quotesThisMonth: number;
  quotesTrendPercent: number | null;
  applicationsThisMonth: number;
  applicationsTrendPercent: number | null;

  newQuotesCount: number;
  newApplicationsCount: number;
  draftServicesCount: number;
  activeJobsCount: number;
  teamMembersCount: number;
  activeUsersCount: number;

  /** 12 valeurs, index 0 = janvier, année en cours. */
  quotesByMonth: number[];
  applicationsByMonth: number[];
}

@Injectable({ providedIn: 'root' })
export class DashboardStatsApi {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  getSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.base}/${environment.endpoints.dashboard.summary}`);
  }
}
