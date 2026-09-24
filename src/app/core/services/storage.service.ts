import { Injectable } from '@angular/core';

const TOKEN_KEY = 'athl_bo_token';
const REMEMBER_KEY = 'athl_bo_remember';

@Injectable({ providedIn: 'root' })
export class StorageService {
  setToken(token: string, remember = true): void {
    if (remember) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(REMEMBER_KEY, 'true');
      sessionStorage.removeItem(TOKEN_KEY);
    } else {
      sessionStorage.setItem(TOKEN_KEY, token);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REMEMBER_KEY);
    }
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
  }

  clearAuth(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REMEMBER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  }
}
