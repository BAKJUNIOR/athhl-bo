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

/**
 * `err.error` est déjà un objet si la requête a utilisé le parsing JSON par défaut.
 * Si un appel a forcé `responseType: 'text'`, le corps d'erreur reste une chaîne
 * brute (potentiellement du JSON) : on tente de la parser plutôt que de l'afficher telle quelle.
 */
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
