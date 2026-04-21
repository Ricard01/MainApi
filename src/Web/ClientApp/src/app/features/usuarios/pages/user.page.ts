import {Component, computed, inject, signal, viewChild} from '@angular/core';
import {UserForm} from '../components/user-form/user-form';
import {UserApi} from '../data-access/user.api';
import {ActivatedRoute, Router} from '@angular/router';
import {toSignal} from '@angular/core/rxjs-interop';
import {map, of, switchMap} from 'rxjs';
import {CreateUserCommand, IdentityResult, UpdateUserCommand, User} from '../data-access/user.model';
import {RolApi} from '../../roles/data-acces/rol.api';
import {SnackbarService} from '../../../shared/services/snackbar.service';
import {UserFormValue, UserMapper} from '../data-access/user.mapper';

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
  roles = toSignal(this.rolApi.getAll(), {initialValue: []})

  // Si hay :id en la ruta es update, si no es create
  private userId = toSignal(this.route.paramMap.pipe(map(p => p.get('id'))));
  isUpdateMode = computed(() => !!this.userId());

  userToUpdate = toSignal(
    this.route.paramMap.pipe(
      map(p => p.get('id')),
      switchMap(id => id ? this.userApi.getById(id) : of(null))
    ),
    {initialValue: null}
  );


  onSave(form: UserFormValue) {

    this.backendErrors.set([]);

    const request$ = this.isUpdateMode()
      ? this.userApi.update(this.userId()!, UserMapper.toUpdate(form, this.userId()!)      )
      : this.userApi.create(UserMapper.toCreate(form));

    request$.subscribe({
      next: (result) => {
        if (result.success) {
          this.snackBar.success(
            this.isUpdateMode() ? 'Actualizado con éxito' : 'Registrado con éxito'
          );
          this.router.navigate(['/usuarios']);
        } else {
          this.backendErrors.set(result.errors);
        }
      },
      error: (errors: string[]) => {
        this.backendErrors.set(errors);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/usuarios']);
  }

}
