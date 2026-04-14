// auth.selectors.ts
// ------------------------------------------------------------
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AUTH_FEATURE_KEY, AuthState } from './auth.reducer';

export const selectAuthState = createFeatureSelector<AuthState>(AUTH_FEATURE_KEY);

// === Básicos ===
export const selectUser = createSelector(selectAuthState, s => s.user);
export const selectSessionStatus = createSelector(selectAuthState, s => s.sessionStatus);

export const selectLoading = createSelector(selectAuthState, s => s.loading);
export const selectError = createSelector(selectAuthState, s => s.error);

// === Derivados para header/UI ===
export const selectUserNombre = createSelector(selectUser, u => u?.nombre ?? '');
export const selectUserRol = createSelector(selectUser, u => u?.rol ?? '');
export const selectUserAvatar = createSelector(selectUser, u => u?.imagenUrl ?? null);
export const selectUserPermisos = createSelector(selectUser, u => u?.permisos ?? 0);

// === Helpers de permisos (bitmask) ===
// Yo-del-futuro: usamos un factory para no hardcodear máscaras en la UI.
// Ejemplo de uso: store.select(selectHasPermission(0b0010))
export function selectHasPermission(mask: number) {
  return createSelector(selectUserPermisos, (permisos) => (permisos & mask) === mask);
}

// Variante: múltiples permisos requeridos
export function selectHasAllPermissions(...masks: number[]) {
  return createSelector(selectUserPermisos, (permisos) =>
    masks.every(m => (permisos & m) === m)
  );
}

// Variante: alguno de varios permisos
export function selectHasAnyPermission(...masks: number[]) {
  return createSelector(selectUserPermisos, (permisos) =>
    masks.some(m => (permisos & m) === m)
  );
}
