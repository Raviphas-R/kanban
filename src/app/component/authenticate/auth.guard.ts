import { inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from './auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const isAuth = authService.getIsAuth();
  if (isAuth) {
    return true;
  }

  return router.navigate(['/sign-in']);
};
