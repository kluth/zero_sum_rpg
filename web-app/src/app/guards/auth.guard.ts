import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SessionService } from '../services/session.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const sessionService = inject(SessionService);

  // Wait for auth to load
  await new Promise<void>(resolve => {
    if (authService.isAuthLoaded()) resolve();
    else {
      const effect = setInterval(() => {
        if (authService.isAuthLoaded()) {
          clearInterval(effect);
          resolve();
        }
      }, 50);
    }
  });

  const user = authService.currentUser();
  if (!user) {
    return router.createUrlTree(['/']);
  }

  const role = route.data['role'] as 'gm' | 'player';
  const sessionId = route.paramMap.get('sessionId');

  if (sessionId && role) {
    const hasAccess = await sessionService.verifyAccess(sessionId, role);
    if (!hasAccess) {
      console.warn(`[Guard] User ${user.uid} denied access to ${role} on session ${sessionId}`);
      return router.createUrlTree(['/']);
    }
  }

  return true;
};
