import {Component, ChangeDetectionStrategy, inject} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {UserApi} from '../data-access/user.api';
import {UserList} from '../components/user-list/user-list';



@Component({
  selector: 'app-user-list-page',
  imports: [UserList],
  template: `

    <h2>Administración Usuarios</h2>

    <app-user-list [users]="users()">
    </app-user-list>

  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserListPage {
  private userApi = inject(UserApi);

  public users = toSignal(this.userApi.getAll(), {initialValue: []});


}
