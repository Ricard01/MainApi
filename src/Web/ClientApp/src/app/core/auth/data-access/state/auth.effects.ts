import {Injectable, NgZone, inject} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {Router} from '@angular/router';
import {AuthActions} from './auth.actions';
import {AuthApi} from '../auth.api';
import {catchError, filter, map, mergeMap, Observable, of, switchMap, tap} from 'rxjs';
import {AUTH_SYNC_KEY, AUTH_USER_KEY} from "../auth.models";

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private api = inject(AuthApi);
  private router = inject(Router);
  private zone = inject(NgZone);


  checkSession$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.checkSessionRequested),
      switchMap(() =>
        this.api.me().pipe(
          map(user => {
            return AuthActions.checkSessionSucceeded({user});
          }),
          catchError(() =>
            of(AuthActions.checkSessionFailed())
          )
        )
      )
    )
  );


  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginRequested),
      mergeMap(({command, returnUrl}) =>
        this.api.login(command).pipe(
          map((user) =>
            AuthActions.loginSucceeded({user, returnUrl})),
          catchError((err) => {
            return of(
              AuthActions.loginFailed({
                error: err?.error.detail ?? 'No se pudo iniciar sesión',
              }))
          })
        )
      )
    )
  );


  loginRedirect$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSucceeded),
        tap(({returnUrl}) => {
          const target = returnUrl ?? '/';
          this.router.navigateByUrl(target);
        })
      ),
    {dispatch: false}
  );

  // ====== LOGOUT (manual, inactividad, desconocido) ======
  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logoutRequested),
      mergeMap(({reason}) =>
        this.api.logout().pipe(
          tap(() => {
            // 1) Limpiar snapshot local
            localStorage.removeItem(AUTH_USER_KEY);
            // 2) Avisar a otras pestañas (broadcast)
            localStorage.setItem(
              AUTH_SYNC_KEY,
              JSON.stringify({type: 'LOGOUT', ts: Date.now(), reason: reason ?? 'Manual'})
            );
            // 3) Redirigir a /login
            this.zone.run(() => this.router.navigate(['/login']));
          }),
          map(() => AuthActions.logoutSucceeded()),
          // Idempotente: si el endpoint falla, limpiamos igual y cerramos sesión local
          catchError(() => {
            localStorage.removeItem(AUTH_USER_KEY);
            localStorage.setItem(
              AUTH_SYNC_KEY,
              JSON.stringify({type: 'LOGOUT', ts: Date.now(), reason: 'Unknown'})
            );
            this.zone.run(() => this.router.navigate(['/login']));
            return of(AuthActions.logoutSucceeded());
          })
        )
      )
    )
  );

  // ====== MULTI-PESTAÑA: escuchar cierres de sesión de otras pestañas ======
  listenOtherTabsLogout$ = createEffect(() =>
    new Observable<StorageEvent>((subscriber) => {
      const handler = (e: StorageEvent) => subscriber.next(e);
      window.addEventListener('storage', handler);
      return () => window.removeEventListener('storage', handler);
    }).pipe(
      map((e) => {
        if (e.key !== AUTH_SYNC_KEY || !e.newValue) return null as any;
        try {
          const payload = JSON.parse(e.newValue);
          return payload?.type === 'LOGOUT'
            ? AuthActions.externalLogoutDetected({reason: 'External'})
            : null;
        } catch {
          return null as any;
        }
      }),
      filter((a): a is ReturnType<typeof AuthActions.externalLogoutDetected> => !!a)
    )
  );

  // Navegación reactiva al logout externo (no despacha nada más)
  externalLogoutNavigate$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.externalLogoutDetected),
        tap(() => {
          // Aseguro limpiar snapshot local por si esta tab era la "rezagada"
          localStorage.removeItem(AUTH_USER_KEY);
          this.zone.run(() => this.router.navigate(['/login']));
        })
      ),
    {dispatch: false}
  );
}
