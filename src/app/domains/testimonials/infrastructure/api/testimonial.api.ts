import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Testimonial, TestimonialUpsertRequest } from '../../domain/entities/testimonial.entity';

@Injectable({ providedIn: 'root' })
export class TestimonialApi {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;
  private readonly ep = environment.endpoints.testimonials;

  list(): Observable<Testimonial[]> {
    return this.http.get<Testimonial[]>(`${this.base}/${this.ep.list}`);
  }

  create(payload: TestimonialUpsertRequest): Observable<Testimonial> {
    return this.http.post<Testimonial>(`${this.base}/${this.ep.create}`, payload);
  }

  update(id: number, payload: TestimonialUpsertRequest): Observable<Testimonial> {
    return this.http.patch<Testimonial>(`${this.base}/${this.ep.update(id)}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${this.ep.byId(id)}`);
  }
}
