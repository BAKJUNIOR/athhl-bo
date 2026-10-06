import { HttpErrorResponse } from '@angular/common/http';


export function extractApiErrorMessage(err: unknown, fallback: string): string {
  if (!(err instanceof HttpErrorResponse)) return fallback;

  if (err.status === 0) {
    return 'Impossible de joindre le serveur. Vérifiez votre connexion.';
  }

  const body = resolveErrorBody(err.error);
  const message = body?.['message'];
  if (typeof message === 'string' && message.trim()) {
    return message;
  }

  return fallback;
}


function resolveErrorBody(raw: unknown): Record<string, unknown> | null {
  if (raw && typeof raw === 'object') return raw as Record<string, unknown>;
  if (typeof raw === 'string' && raw.trim().startsWith('{')) {
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
  return null;
}
