import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {UserUpdate} from '../components/user-edit/user-update';
import {UserApi} from '../data-access/user.api';
import {ActivatedRoute, Router} from '@angular/router';
import {toSignal} from '@angular/core/rxjs-interop';
import {map, of, switchMap} from 'rxjs';
import {RolApi} from '../../roles/data-acces/rol.api';
import {SnackbarService} from '../../../shared/services/snackbar.service';
import {UserFormValue, UserMapper} from '../data-access/user.mapper';
import {UserCreate} from '../components/user-create/user-create';

@Component({
  selector: 'app-user-page',
  imports: [UserUpdate, UserCreate],
  template: `

    @if (isUpdate()) {
      <app-user-update
        [user]="userToUpdate()"
        [roles]="roles()"
        [errors]="backendErrors()"
        (save)="onSave($event)"
        (cancel)="onCancel()">
      </app-user-update>

    } @else {
      <app-user-create
        [roles]="roles()"
        [errors]="backendErrors()"
        (save)="onSave($event)"
        (cancel)="onCancel()">
      </app-user-create>
    }

  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserPage {

  private readonly userApi = inject(UserApi);
  private readonly rolApi = inject(RolApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(SnackbarService);


  readonly backendErrors = signal<string[]>([]);
  readonly roles = toSignal(this.rolApi.getAll(), {initialValue: []})
  readonly isUpdate = computed(() => !!this.userId());

  // Si hay :id en la ruta es update, si no es create
  private userId = toSignal(this.route.paramMap.pipe(map(p => p.get('id'))));



  userToUpdate = toSignal(
    this.route.paramMap.pipe(
      map(p => p.get('id')),
      switchMap(id => id ? this.userApi.getById(id) : of(null))
    ),
    {initialValue: null}
  );


  onSave(form: UserFormValue) {

    this.backendErrors.set([]);

    const request$ = this.isUpdate()
      ? this.userApi.update(this.userId()!, UserMapper.toUpdate(form, this.userId()!)      )
      : this.userApi.create(UserMapper.toCreate(form));

    request$.subscribe({
      next: (result) => {
        if (result.success) {
          this.snackBar.success(
            this.isUpdate() ? 'Actualizado con éxito' : 'Registrado con éxito'
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

  protected onCancel(): void {
    this.router.navigate(['/usuarios']);
  }

}
