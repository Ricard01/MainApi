// import { inject } from '@angular/core';
// import { CanActivateFn, Router } from '@angular/router';
// import { Store } from '@ngrx/store';
// import { map, take, combineLatest } from 'rxjs';
// import {AuthFacade} from "../../features/auth/data-access/state/auth.facade";
// import * as AuthSelectors from '../../features/auth/data-access/state/auth.selectors';
// // import { AuthFacade } from '../auth/state/auth.facade';
//
// // Factory para canActivate con máscara requerida
// export function canActivateWithPermission(requiredMask: number): CanActivateFn {
//   return () => {
//     const store = inject(Store);
//     const router = inject(Router);
//     const facade = inject(AuthFacade);
//
//     facade.checkSession(); // por si acaso
//
//     const ready$ = store.select(AuthSelectors.selectSessionReady);
//     const isAuth$ = store.select(AuthSelectors.selectIsAuthenticated);
//     const hasPerm$ = store.select(AuthSelectors.selectHasPermission(requiredMask));
//
//     return combineLatest([ready$, isAuth$, hasPerm$]).pipe(
//       take(1),
//       map(([ready, isAuth, hasPerm]) => {
//         if (!ready) return false;
//         if (!isAuth) {
//           // No auth => a login con returnUrl
//           return router.createUrlTree(['/login']);
//         }
//         if (!hasPerm) {
//           // Auth pero sin permiso => forbidden
//           return router.createUrlTree(['/forbidden']);
//         }
//         return true;
//       })
//     );
//   };
// }
