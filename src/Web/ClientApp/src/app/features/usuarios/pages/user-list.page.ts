import {Component, ChangeDetectionStrategy, inject, signal} from '@angular/core';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';
import {UserApi} from '../data-access/user.api';
import {UserList} from '../components/user-list/user-list';
import {switchMap} from 'rxjs';
import {IdentityResult, UserListItem} from '../data-access/user.model';
import {SnackbarService} from '../../../shared/services/snackbar.service';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {MatButtonModule} from '@angular/material/button';


@Component({
  selector: 'app-user-list-page',
  imports: [UserList, MatButtonModule],
  template: `

    <h2>Administración Usuarios</h2>

    <app-user-list
      [users]="users()"
      (delete)="onDelete($event)">
    </app-user-list>

  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserListPage {
  private userApi = inject(UserApi);
  private reload = signal(0);
  private snackBar = inject(SnackbarService);

  public users = toSignal(
    toObservable(this.reload).pipe(
      switchMap(() => this.userApi.getAll())
    ),
    {initialValue: []}
  );

  onDelete(user: UserListItem) {
    this.userApi.delete(user.id).subscribe({
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
