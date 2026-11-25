import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const userGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.loggedIn()) return true;
  return router.createUrlTree(['/login']);
};

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAdmin()) return true;
  if (auth.isUser()) return router.createUrlTree(['/inicio']);
  return router.createUrlTree(['/login']);
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAdmin()) return router.createUrlTree(['/admin']);
  if (auth.isUser()) return router.createUrlTree(['/inicio']);
  return true;
};

export const registrationDraftGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAdmin()) return router.createUrlTree(['/admin']);
  if (auth.isUser()) return router.createUrlTree(['/inicio']);
  if (auth.hasRegistrationDraft()) return true;
  return router.createUrlTree(['/registro']);
};
