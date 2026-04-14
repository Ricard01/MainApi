import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {filter, map, take,} from 'rxjs';
import {selectSessionStatus} from '../auth/data-access/state/auth.selectors';

export const authGuard: CanActivateFn = (route, state) => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(selectSessionStatus).pipe(
    filter(status => status !== 'checking'), // 👈 CLAVE
    take(1),
    map(status => {
      if (status === 'authenticated') return true;

      return router.createUrlTree(['/login'], {
        queryParams: {returnUrl: state.url}
      });
    })
  );
};
