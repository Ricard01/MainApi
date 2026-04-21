import {CreateUserCommand, UpdateUserCommand} from './user.model';

export type UserFormValue = {
  userName: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  email: string;
  telefono?: string;
  password?: string;
  idRol: string;
  isActive?: boolean;
  imagenPerfilUrl?: string;
};

export const UserMapper = {

  toCreate(form: UserFormValue): CreateUserCommand {
    return {
      userName: form.userName,
      nombre: form.nombre,
      apellidoPaterno: form.apellidoPaterno,
      apellidoMaterno: form.apellidoMaterno,
      email: form.email,
      telefono: form.telefono,
      password: form.password!,
      idRol: form.idRol,
      imagenPerfilUrl: form.imagenPerfilUrl
    };
  },

  toUpdate(form: UserFormValue, id: string): UpdateUserCommand {
    return {
      id,
      nombre: form.nombre,
      apellidoPaterno: form.apellidoPaterno,
      apellidoMaterno: form.apellidoMaterno,
      email: form.email,
      telefono: form.telefono,
      idRol: form.idRol,
      isActive: form.isActive!,
      imagenPerfilUrl: form.imagenPerfilUrl
    };
  }

};
