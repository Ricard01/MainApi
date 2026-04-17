import {Component, inject, viewChild, computed,  ChangeDetectionStrategy} from '@angular/core';
import {MatTableModule, MatTableDataSource} from '@angular/material/table';
import {MatSortModule, MatSort} from '@angular/material/sort';
import {MatPaginatorModule, MatPaginator} from '@angular/material/paginator';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {toSignal} from '@angular/core/rxjs-interop';
import {UserApi} from '../../data-access/user.api';


@Component({
  selector: 'app-user-list',
  imports: [
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './user-list.html',
  styles: [`
    .profile-container {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .profile-circle {
      border-radius: 50%;
      object-fit: cover;
      border: 1px solid #ddd;
    }

  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserList {
  private userApi = inject(UserApi);

  private sort = viewChild.required(MatSort);
  private paginator = viewChild.required(MatPaginator);
  private usersRaw = toSignal(this.userApi.getAll(), {initialValue: []});
  displayedColumns: string[] = ['userName', 'nombre', 'rol', 'telefono', 'email','estatus','opciones'];

  readonly DEFAULT_IMAGE = 'assets/imgs/user.png';


  dataSource = computed(() => {
    const dataSource = new MatTableDataSource(this.usersRaw());

    dataSource.sort = this.sort();
    dataSource.paginator = this.paginator();


    dataSource.filterPredicate = (data: any, filter: string) => {
      return data.userName.toLowerCase().includes(filter) ||
        data.nombre.toLowerCase().includes(filter);
    };

    return dataSource;
  });


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;

    this.dataSource().filter = filterValue.trim().toLowerCase();

    if (this.dataSource().paginator) {
      this.dataSource().paginator?.firstPage();
    }
  }

  updateUrl(event: Event) {
    (event.target as HTMLImageElement).src = this.DEFAULT_IMAGE;
  }
}
