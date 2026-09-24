import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { ToastService } from '../services/toast.service';
import { StorageService } from '../services/storage.service';
import { extractApiErrorMessage } from '../utils/api-error.util';

/** Endpoints publics : un 401 dessus signifie identifiants/code invalides, pas une session expirée. */
const PUBLIC_PATHS = ['authenticate', 'users/activation', 'users/resend-activation-code'];
/** Endpoints dont le composant appelant affiche déjà le message d'erreur lui-même (inline). */
const INLINE_ERROR_PATHS = [...PUBLIC_PATHS, 'users/change-password', 'users/register'];

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  const storage = inject(StorageService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: unknown) => {
      const httpErr = err instanceof HttpErrorResponse ? err : null;
      const status = httpErr?.status ?? 0;
      const url = httpErr?.url ?? '';
      const isPublicRequest = PUBLIC_PATHS.some((p) => url.includes(p));
      const skipToast = INLINE_ERROR_PATHS.some((p) => url.includes(p));

      if (status === 401 && !isPublicRequest) {
        storage.clearAuth();
        toast.error(extractApiErrorMessage(err, 'Session expirée. Veuillez vous reconnecter.'));
        router.navigateByUrl('/signin');
        return throwError(() => err);
      }

      if (!skipToast) {
        const fallback = status === 403
          ? "Vous n'avez pas les droits nécessaires pour effectuer cette action."
          : 'Une erreur est survenue. Veuillez réessayer.';
        toast.error(extractApiErrorMessage(err, fallback));
      }

      return throwError(() => err);
    })
  );
};
