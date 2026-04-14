export interface LoginCommand {
  userName: string;
  password: string;
  rememberMe: boolean;
}

export interface AuthUser {
  id: string;
  matricula: string;
  nombre: string;
  imagenUrl: string;
  rol: string;
  permisos: number;
}

export const AUTH_USER_KEY = 'auth_user';
export const AUTH_SYNC_KEY = 'auth_sync';


// Bitmask helper (regla práctica: negativo = ALL)
export function hasPermission(userMask: number, required: number): boolean {
  if (!required) return false;
  if (userMask < 0) return true; // -1 del backend ⇒ todos los permisos
  return (userMask & required) === required;
}


// /** Razones estandarizadas para el cierre de sesión **/
// export type LogoutReason = 'Manual' | 'Inactivity' | 'External' | 'Expired' | 'Unknown';
//
// /** Payload de error simple y consistente */
// export interface AuthErrorPayload {
//   message: string;      // lo que mostramos al usuario
//   code?: string;        // opcional, p. ej. "INVALID_CREDENTIALS", "NETWORK"
//   status?: number;      // opcional, HTTP status (401/403/500…)
// }
//

// // (Opcional) enum de permisos — alinear con backend si lo usas.
// export enum Permisos {
//   None      = 0,
//   UserRead  = 1 << 0,
//   UserWrite = 1 << 1,
//   RoleRead  = 1 << 2,
//   RoleWrite = 1 << 3,
//   All31     = 0x7fffffff
// }
