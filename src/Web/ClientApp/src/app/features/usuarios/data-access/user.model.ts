export interface User {
  id: string;
  userName: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string | null;
  email: string;
  telefono?: string | null;
  imagenPerfilUrl?: string | null;
  idRol: string;
  rolName: string;
}

export interface UserList {
  id: string;
  userName: string;
  nombre: string;
  email: string;
  telefono?: string | null;
  imagenPerfilUrl?: string | null;
  rolName: string;
}
export interface CreateUserCommand {
  userName: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string | null;
  email: string;
  telefono?: string | null;
  password: string;
  imagenPerfilUrl?: string | null;
  idRol: string;
}


export interface UpdateUserCommand {
  id: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string | null;
  email: string;
  telefono?: string | null;
  imagenPerfilUrl?: string | null;
  idRol: string;
}
