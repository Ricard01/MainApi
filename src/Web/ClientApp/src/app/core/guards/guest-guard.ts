import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {filter, map, take} from 'rxjs';
import {Store} from "@ngrx/store";
import {selectSessionStatus} from '../auth/data-access/state/auth.selectors';

// Evita que un usuario autenticado vea /loginSi ya hay sesión, redirige a returnUrl (si viene) o al fallback.
export const guestGuard: CanActivateFn = (route, state) => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(selectSessionStatus).pipe(
    filter(status => status !== 'checking'), // 👈 CLAVE
    take(1),
    map(status => {
      if (status === 'authenticated') {
        const returnUrl = route.queryParamMap.get('returnUrl') || '/';
        return router.createUrlTree([returnUrl]);
      }
      return true;
    })
  );
};
