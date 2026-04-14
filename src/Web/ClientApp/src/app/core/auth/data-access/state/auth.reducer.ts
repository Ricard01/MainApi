import {createReducer, on} from '@ngrx/store';
import {AuthActions} from './auth.actions';
import {AuthUser} from '../auth.models';

export const AUTH_FEATURE_KEY = 'auth';

export interface AuthState {
  user: AuthUser | null;
  sessionStatus: 'checking' | 'authenticated' | 'anonymous';
  loading: boolean;
  error: string | null;
}

export const initialState: AuthState = {
  user: null,
  sessionStatus: 'checking',
  loading: false,
  error: null,
};

export const authReducer = createReducer(
  initialState,

  // ========== CHECK SESSION ==========
  on(AuthActions.checkSessionRequested, (state): AuthState => ({
    ...state,
    sessionStatus: 'checking',
    loading: true,
    error: null
  })),
  on(AuthActions.checkSessionSucceeded, (state, {user}): AuthState => ({
    ...state,
    user,
    sessionStatus: user ? 'authenticated' : 'anonymous',
    loading: false,
    error: null,
  })),

  on(AuthActions.checkSessionFailed, (state): AuthState => ({
    ...state,
    user: null,
    sessionStatus: 'anonymous',
    loading: false,
  })),

  // ========== LOGIN ==========
  on(AuthActions.loginRequested, (state): AuthState => ({...state, loading: true, error: null})),
  on(AuthActions.loginSucceeded, (state, {user}): AuthState => ({
    ...state,
    user,
    sessionStatus: 'authenticated',
    loading: false,
    error: null,
  })),
  on(AuthActions.loginFailed, (state, {error}): AuthState => ({
    ...state,
    loading: false,
    sessionStatus: 'anonymous',
    error
  })),

  // ========== LOGOUT ==========
  on(AuthActions.logoutRequested, (state): AuthState => ({...state, loading: true, error: null})),
  on(AuthActions.logoutSucceeded, (state): AuthState => ({
    ...initialState, //  Dejamos sessionReady en true para que guards ¿Por qué? Porque ya sabemos con certeza que NO hay sesión.No queremos que los Guards se queden esperando eternamente.
  })),

  // ========== MULTI-TAB ==========
  // Si otra pestaña disparó LOGOUT, aquí  limpiamos estado local.
  on(AuthActions.externalLogoutDetected, (state): AuthState => ({
    ...initialState,
  })),

  // ========== UX ==========
  on(AuthActions.clearError, (state): AuthState => ({...state, error: null,}))
);
