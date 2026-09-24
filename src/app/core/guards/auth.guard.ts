import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { StorageService } from '../services/storage.service';
import { JwtService } from '../services/jwt.service';

export const authGuard: CanActivateFn = () => {
  const storage = inject(StorageService);
  const jwt = inject(JwtService);
  const router = inject(Router);

  const token = storage.getToken();
  if (!token || jwt.isExpired(token)) {
    storage.clearAuth();
    router.navigateByUrl('/signin');
    return false;
  }
  return true;
};
