import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { StorageService } from '../services/storage.service';
import { JwtService } from '../services/jwt.service';
import { ToastService } from '../services/toast.service';

/** Pages réservées au SUPER_ADMIN (gestion des utilisateurs) — les autres pages du BO utilisent adminGuard. */
export const superAdminGuard: CanActivateFn = () => {
  const storage = inject(StorageService);
  const jwt = inject(JwtService);
  const toast = inject(ToastService);
  const router = inject(Router);

  if (jwt.isSuperAdmin(storage.getToken())) return true;

  toast.warning("Vous n'avez pas les droits nécessaires pour accéder à cette page.");
  return router.createUrlTree(['/']);
};
