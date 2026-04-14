import {createActionGroup, emptyProps, props} from "@ngrx/store";
import {AuthUser, LoginCommand} from "../auth.models";


// ------------------------------------------------------------
// Acciones del feature Auth. Mantengo el flujo simple:
// - checkSessionRequested -> lee localStorage y emite checkSessionSucceeded(user|null)
// - loginRequested -> hace POST /auth/login; si OK guarda user en storage (efecto) y emite loginSucceeded(user)
// - logoutRequested -> llama /auth/logout; limpia storage y emite logoutSucceeded
// - externalLogoutDetected -> trigger cuando otra pestaña cerró sesión (storage event)
// - clearError -> limpiar mensajes de error visibles en la UI

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    // Sesión: solo “lee” localStorage; NO llama red.
    'Check Session Requested': emptyProps(),
    'Check Session Succeeded': props<{ user: AuthUser | null }>(),

    // Login: el returnUrl lo maneja el componente/guard vía Router, no se guarda en el store.
    'Login Requested': props<{ command: LoginCommand; returnUrl?: string | null }>(),
    'Login Succeeded': props<{ user: AuthUser }>(),
    'Login Failed': props<{ message: string; code?: string; status?: number }>(),

    // Logout explícito (clic en "Cerrar sesión") o por inactividad (efectos distintos lo disparan)
    'Logout Requested': props<{ reason?: 'Manual' | 'Inactivity' | 'Unknown' }>(),
    'Logout Succeeded': emptyProps(),

    // Multi-pestaña: otra tab escribió AUTH_SYNC_KEY con LOGOUT
    'External Logout Detected': props<{ reason: 'External' }>(),

    // UX: limpiar errores en banners/toasts
    'Clear Error': emptyProps(),
  },
});

