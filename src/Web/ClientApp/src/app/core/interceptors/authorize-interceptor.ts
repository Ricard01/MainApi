// // auth-401.interceptor.ts (funcional)
// import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
// import {inject} from '@angular/core';
// import {catchError, mergeMap, of} from "rxjs";
// import { AuthFacade } from 'src/app/features/auth/data-access/state/auth.facade';
//
//
//
// function isAuthEndpoint(url: string): boolean {
//   return url.includes('/api/auth/');
// }
//
// // Si la sesion expira, redirige a login
// export const auth401Interceptor: HttpInterceptorFn = (req, next) => {
//   const auth = inject(AuthFacade);
//
//   return next(req).pipe(
//     catchError((err: any) => {
//       if (err instanceof HttpErrorResponse && err.status === 401 && !isAuthEndpoint(req.url)) {
//         // Solo 401 de recursos protegidos => sesión inválida/expirada
//         auth.logout();
//       }
//       // Deja pasar el error; el effect de login ya maneja 401 de /auth/login
//       return of(err).pipe(mergeMap(() => {
//         throw err;
//       }));
//     })
//   );
// };
