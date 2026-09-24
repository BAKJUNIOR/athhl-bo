import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { StorageService } from '../services/storage.service';
import { JwtService } from '../services/jwt.service';
import { ToastService } from '../services/toast.service';

export const adminGuard: CanActivateFn = () => {
  const storage = inject(StorageService);
  const jwt = inject(JwtService);
  const toast = inject(ToastService);
  const router = inject(Router);

  const token = storage.getToken();
  if (jwt.isAdmin(token)) return true;

  toast.warning("Vous n'avez pas les droits nécessaires pour accéder à cette page.");
  return router.createUrlTree(['/']);
};
