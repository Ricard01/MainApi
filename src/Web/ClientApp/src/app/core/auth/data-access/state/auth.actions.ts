import {createActionGroup, emptyProps, props} from "@ngrx/store";
import {AuthUser, LoginCommand} from "../auth.models";

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {

    // se ejecuta en app.ts para validar si existe un usuario authenticated
    'Check Session Requested': emptyProps(),
    'Check Session Succeeded': props<{ user: AuthUser | null }>(),
    'Check Session Failed':  emptyProps(), // no muestro mensaje de error para que el state error no me muestre un error cuando entro a login ya que checkSession se dispara antes en app.ts

    // Login: el returnUrl lo maneja el componente/guard vía Router, no se guarda en el store.
    'Login Requested': props<{ command: LoginCommand; returnUrl?: string | null }>(),
    'Login Succeeded': props<{ user: AuthUser , returnUrl?: string | null}>(),
    'Login Failed': props<{ error: string; }>(),

    // Logout explícito (clic en "Cerrar sesión") o por inactividad (efectos distintos lo disparan)
    'Logout Requested': props<{ reason?: 'Manual' | 'Inactivity' | 'Unknown' }>(),
    'Logout Succeeded': emptyProps(),

    // Multi-pestaña: otra tab escribió AUTH_SYNC_KEY con LOGOUT
    'External Logout Detected': props<{ reason: 'External' }>(),

    // UX: limpiar errores en banners/toasts
    'Clear Error': emptyProps(),
  },
});

