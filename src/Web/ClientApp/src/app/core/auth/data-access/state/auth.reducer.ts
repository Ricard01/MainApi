// auth.reducer.ts
// ------------------------------------------------------------
import { createReducer, on } from '@ngrx/store';
import { AuthActions } from './auth.actions';
import { AuthUser } from '../auth.models';

export const AUTH_FEATURE_KEY = 'auth';

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  sessionReady: boolean;     // "Ya chequeé storage/efectos" -> evita parpadeos en UI
  loading: boolean;
  error: string | null;
}

export const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  sessionReady: false,
  loading: false,
  error: null,
};

export const authReducer = createReducer(
  initialState,

  // ========== CHECK SESSION ==========
  // Lee localStorage en el effect.
  on(AuthActions.checkSessionRequested, (state): AuthState => ({...state, loading: true, error: null,  })),
  on(AuthActions.checkSessionSucceeded, (state, { user }): AuthState => ({
    ...state,
    user,
    isAuthenticated: !!user,
    sessionReady: true, // ya podemos renderizar header/decidir guards sin "duda"
    loading: false,
    error: null,
  })),

  // ========== LOGIN ==========
  on(AuthActions.loginRequested, (state): AuthState => ({...state, loading: true, error: null})),
  on(AuthActions.loginSucceeded, (state, { user }): AuthState => ({
    ...state,
    user,
    isAuthenticated: true,
    sessionReady: true,
    loading: false,
    error: null,
  })),
  on(AuthActions.loginFailed, (state, { message }): AuthState => ({
    ...state,
    loading: false,
    isAuthenticated: false,
    // No toco sessionReady aquí: puede venir de un check previo.
    error: message,
  })),

  // ========== LOGOUT ==========
  on(AuthActions.logoutRequested, (state): AuthState => ({...state, loading: true, error: null })),
  on(AuthActions.logoutSucceeded, (state): AuthState => ({...initialState,
    sessionReady: true,  //  Dejamos sessionReady en true para que guards ¿Por qué? Porque ya sabemos con certeza que NO hay sesión.No queremos que los Guards se queden esperando eternamente.
  })),

  // ========== MULTI-TAB ==========
  // Si otra pestaña disparó LOGOUT, aquí  limpiamos estado local.
  on(AuthActions.externalLogoutDetected, (state): AuthState => ({
    ...initialState,
    sessionReady: true,
  })),

  // ========== UX ==========
  on(AuthActions.clearError, (state): AuthState => ({...state, error: null, }))
);
