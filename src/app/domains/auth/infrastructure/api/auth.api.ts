import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {
  ActivateAccountRequest,
  AuthenticateRequest,
  AuthenticateResponse,
  ChangePasswordRequest,
  CurrentUser,
  ResendActivationRequest,
  UpdateProfileRequest,
} from '../../domain/entities/auth.entity';


@Injectable({ providedIn: 'root' })
export class AuthApi {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;
  private readonly ep = environment.endpoints;

  authenticate(payload: AuthenticateRequest): Observable<AuthenticateResponse> {
    return this.http.post<AuthenticateResponse>(`${this.base}/${this.ep.auth.authenticate}`, payload);
  }

  currentUser(): Observable<CurrentUser> {
    return this.http.get<CurrentUser>(`${this.base}/${this.ep.users.currentUser}`);
  }

  activate(payload: ActivateAccountRequest): Observable<string> {
    // Le backend renvoie du texte brut (ResponseEntity<String>, pas de JSON).
    return this.http.post(`${this.base}/${this.ep.users.activation}`, payload, { responseType: 'text' });
  }

  resendActivationCode(payload: ResendActivationRequest): Observable<string> {
    return this.http.post(`${this.base}/${this.ep.users.resendActivation}`, payload, { responseType: 'text' });
  }

  updateProfile(payload: UpdateProfileRequest): Observable<CurrentUser> {
    return this.http.put<CurrentUser>(`${this.base}/${this.ep.users.updateProfile}`, payload);
  }

  changePassword(payload: ChangePasswordRequest): Observable<string> {
    return this.http.put(`${this.base}/${this.ep.users.changePassword}`, payload, { responseType: 'text' });
  }
}
