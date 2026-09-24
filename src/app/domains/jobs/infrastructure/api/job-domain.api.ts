import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { JobDomainOption } from '../../domain/entities/job-offer.entity';

export interface JobDomainUpsertRequest {
  labelFr: string;
  labelEn?: string;
}

@Injectable({ providedIn: 'root' })
export class JobDomainApi {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;
  private readonly ep = environment.endpoints.jobDomains;

  list(): Observable<JobDomainOption[]> {
    return this.http.get<JobDomainOption[]>(`${this.base}/${this.ep.list}`);
  }

  create(payload: JobDomainUpsertRequest): Observable<JobDomainOption> {
    return this.http.post<JobDomainOption>(`${this.base}/${this.ep.create}`, payload);
  }

  update(id: number, payload: JobDomainUpsertRequest): Observable<JobDomainOption> {
    return this.http.patch<JobDomainOption>(`${this.base}/${this.ep.byId(id)}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${this.ep.byId(id)}`);
  }
}
