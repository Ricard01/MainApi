export interface User {
  userName: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  email: string;
  telefono?: string;
  imagenPerfilUrl?: string;
  idRol: string;
  rolName: string;
  isActive: boolean;
}

export interface UserListItem {
  id: string;
  userName: string;
  nombre: string;
  email: string;
  telefono?: string;
  imagenPerfilUrl?: string;
  rolName: string;
  isActive: boolean;
}

export interface CreateUserCommand {
  userName: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  email: string;
  telefono?: string;
  password: string;
  imagenPerfilUrl?: string;
  idRol: string;
  // isActive: boolean; se maneja en backend
}

export interface UpdateUserCommand {
  id: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  email: string;
  telefono?: string;
  imagenPerfilUrl?: string;
  idRol: string;
  isActive: boolean;
}

export interface IdentityResult {
  success: boolean;
  errors: string[];
}
