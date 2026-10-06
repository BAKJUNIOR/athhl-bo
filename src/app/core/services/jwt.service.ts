import { Injectable } from '@angular/core';

export interface JwtPayload {
  sub: string;
  exp: number;
  iat: number;
  userId?: number;
  firstName?: string;
  lastName?: string;
  auth?: string[];
}

@Injectable({ providedIn: 'root' })
export class JwtService {
  /** Décode le payload JWT (sans vérifier la signature côté client). */
  decodePayload(token: string | null): JwtPayload | null {
    if (!token) return null;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const decoded = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded) as JwtPayload;
    } catch {
      return null;
    }
  }

  isExpired(token: string | null): boolean {
    const payload = this.decodePayload(token);
    if (!payload?.exp) return true;
    const nowSec = Math.floor(Date.now() / 1000);
    return payload.exp <= nowSec;
  }

  getRoles(token: string | null): string[] {
    return this.decodePayload(token)?.auth ?? [];
  }

  /** Accès au BO (tout le contenu du site) : ADMIN et SUPER_ADMIN. */
  isAdmin(token: string | null): boolean {
    const roles = this.getRoles(token);
    return roles.includes('ADMIN') || roles.includes('SUPER_ADMIN');
  }

  /** Gestion des utilisateurs du BO : SUPER_ADMIN uniquement (aligné sur SecurityConfig côté backend). */
  isSuperAdmin(token: string | null): boolean {
    return this.getRoles(token).includes('SUPER_ADMIN');
  }
}
