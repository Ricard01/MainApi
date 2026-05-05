import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {RolList} from '../components/rol-list/rol-list';
import {RolApi} from '../data-acces/rol.api';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';
import {switchMap} from 'rxjs';
import {RolListItem} from '../data-acces/rol.model';
import {SnackbarService} from '../../../shared/services/snackbar.service';
import {IdentityResult} from '../../usuarios/data-access/user.model';

@Component({
  selector: 'app-rol-list-page',
  imports: [MatButtonModule, RolList],
  template: `
    <h2>Administración de Roles y Permisos </h2>
    <app-rol-list
      [roles]="roles()">
    </app-rol-list>


  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RolListPage {

  private rolApi = inject(RolApi);
  private snackBar = inject(SnackbarService);
  private reload = signal(0); // para que podamos actualizar los roles , cuando por ejemplo se elimina un rol


  roles = toSignal(
    toObservable(this.reload).pipe(
      switchMap(() => this.rolApi.getAll())
    ), {initialValue: []});


  onDelete(rol: RolListItem) {
    this.rolApi.delete(rol.id).subscribe({
      next: (result: IdentityResult) => {
        if (result.success) {
          this.reload.update(v => v + 1);
          this.snackBar.success('Usuario eliminado');
        } else {
          this.snackBar.error(result.errors.join('\n'));
        }
      },
      error: (error: string) => {
        this.snackBar.error(`Api ${error}`);
      }
    });
  }


}
