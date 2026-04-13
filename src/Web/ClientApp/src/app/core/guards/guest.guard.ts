//
// import {inject} from '@angular/core';
// import {CanActivateFn, Router} from '@angular/router';
// import {combineLatest, map, take} from 'rxjs';
// import {AuthFacade} from "src/app/features/auth/data-access/state/auth.facade";
// import {Store} from "@ngrx/store";
// import * as AuthSelectors from 'src/app/features/auth/data-access/state/auth.selectors';
//
// // Evita que un usuario autenticado vea /login
// // Si ya hay sesión, redirige a returnUrl (si viene) o al fallback.
// export const guestGuard: CanActivateFn = (route, state) => {
//   const store = inject(Store);
//   const router = inject(Router);
//   const facade = inject(AuthFacade);
//
//   facade.checkSession();
//
//   const ready$ = store.select(AuthSelectors.selectSessionReady);
//   const isAuth$ = store.select(AuthSelectors.selectIsAuthenticated);
//
//   return combineLatest([ready$, isAuth$]).pipe(
//     take(1),
//     map(([ready, isAuth]) => {
//       if (!ready) return false;
//       return isAuth ? router.createUrlTree(['/']) : true;
//     })
//   );
// };
