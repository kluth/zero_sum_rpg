import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const token = localStorage.getItem('zero_sum_token');
      if (token) {
        return true;
      }
    }
  } catch (e) {
    console.error('Error reading zero_sum_token from localStorage:', e);
  }
  return router.createUrlTree(['/']);
};
