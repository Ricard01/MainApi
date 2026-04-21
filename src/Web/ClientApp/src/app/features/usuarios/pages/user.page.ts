import {Component, computed, inject, signal, viewChild} from '@angular/core';
import {UserForm} from '../components/user-form/user-form';
import {UserApi} from '../data-access/user.api';
import {ActivatedRoute, Router} from '@angular/router';
import {toSignal} from '@angular/core/rxjs-interop';
import {map, of, switchMap} from 'rxjs';
import {CreateUserCommand, IdentityResult, UpdateUserCommand, User} from '../data-access/user.model';
import {RolApi} from '../../roles/data-acces/rol.api';
import {SnackbarService} from '../../../shared/services/snackbar.service';

@Component({
  selector: 'app-user-page',
  imports: [UserForm],
  template: `
    <app-user-form
      [user]="userToUpdate()"
      [roles]="roles()"
      [serverErrors]="backendErrors()"
      (save)="onSave($event)"
      (cancel)="onCancel()">
    </app-user-form>
  `,
})
export class UserPage {

  private userApi = inject(UserApi);
  private rolApi = inject(RolApi);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(SnackbarService);


  backendErrors = signal<string[]>([]);


  private userId = toSignal(
    this.route.paramMap.pipe(map(p => p.get('id')))
  );

  roles = toSignal(this.rolApi.getAll(), {initialValue: []})

  isEditMode = computed(() => !!this.userId());   // Si hay :id en la ruta → editar, si no → crear

  userToUpdate = toSignal(
    this.route.paramMap.pipe(
      map(p => p.get('id')),
      switchMap(id => id ? this.userApi.getById(id) : of(null))
    ),
    {initialValue: null}
  );

  onSave(form: any) {

    this.backendErrors.set([]); // limpiar errores anteriores

    if (this.isEditMode()) {

      const command: UpdateUserCommand = {
        id: this.userId()!,
        nombre: form.nombre,
        apellidoPaterno: form.apellidoPaterno,
        apellidoMaterno: form.apellidoMaterno,
        email: form.email,
        telefono: form.telefono,
        idRol: form.idRol,
        isActive: form.isActive,
        imagenPerfilUrl: form.imagenPerfilUrl
      };

      this.userApi.update(command.id, command).subscribe({
        next: (result) => {
          if (result.success)
            this.snackBar.success("resultado");
          else {
            this.snackBar.error("resultado: ");
            this.backendErrors.set(result.errors);
          }


        },
        error: (err) => console.error('Error al actualizar el usuario:', err)
      });

    } else {

      const command: CreateUserCommand = {
        userName: form.userName,
        nombre: form.nombre,
        apellidoPaterno: form.apellidoPaterno,
        apellidoMaterno: form.apellidoMaterno,
        email: form.email,
        telefono: form.telefono,
        password: form.password!, // aquí sí garantizas que existe
        idRol: form.idRol,
        imagenPerfilUrl: form.imagenPerfilUrl,
        isActive: true // backend lo ignora o lo puedes omitir si quieres
      };

      this.userApi.create(command).subscribe({
        next: (result: IdentityResult) => {

          if (result.success) {
            this.snackBar.success("Registro con éxito");
            this.router.navigate(['/usuarios']);
          } else {
            this.backendErrors.set(result.errors);
          }


        },
        error: (err) => this.backendErrors.set(err)
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/usuarios']);
  }

}
