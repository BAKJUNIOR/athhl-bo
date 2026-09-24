import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { StorageService } from '../services/storage.service';

const NO_AUTH_PATHS = [
  'authenticate',
  'users/activation',
  'users/resend-activation-code',
];

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const storage = inject(StorageService);
  const token = storage.getToken();

  const isNoAuth = NO_AUTH_PATHS.some((path) => req.url.includes(path));

  if (token && !isNoAuth) {
    const cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
    return next(cloned);
  }

  return next(req);
};
