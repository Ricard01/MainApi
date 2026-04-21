// Queries
export interface Rol {
  id: string;
  nombre: string;
  descripcion: string;
  permisos: Permiso[];
}

export interface RolListItem {
  id: string;
  nombre: string;
  descripcion?: string | null;
}

export interface Permiso {
  id: number;
  nombre: string;
  modulo: string;
  descripcion?: string | null;
}

// Commands
export interface CreateRolCommand {
  nombre: string;
  descripcion: string;
  permisosIds: number[];
}

export interface UpdateRolCommand {
  id: string;
  nombre: string;
  descripcion: string;
  permisosIds: number[];
}
