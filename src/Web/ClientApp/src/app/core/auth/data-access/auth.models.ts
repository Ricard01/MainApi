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

export const AUTH_SYNC_KEY = 'auth_sync';


// Bitmask helper (regla práctica: negativo = ALL)
export function hasPermission(userMask: number, required: number): boolean {
  if (!required) return false;
  if (userMask < 0) return true; // -1 del backend ⇒ todos los permisos
  return (userMask & required) === required;
}

