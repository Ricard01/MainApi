import {
  Component,
  viewChild,
  ChangeDetectionStrategy,
  input,
  afterNextRender,
  effect
} from '@angular/core';
import {MatTableModule, MatTableDataSource} from '@angular/material/table';
import {MatSortModule, MatSort} from '@angular/material/sort';
import {MatPaginatorModule, MatPaginator} from '@angular/material/paginator';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {UserListItem} from '../../data-access/user.model';
import {RouterModule} from '@angular/router';
import {NgOptimizedImage} from '@angular/common';


@Component({
  selector: 'app-user-list',
  imports: [
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    RouterModule,
    NgOptimizedImage
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
  public users = input.required<UserListItem[]>();


  private sort = viewChild.required(MatSort);
  private paginator = viewChild.required(MatPaginator);
  dataSource = new MatTableDataSource<UserListItem>();
  displayedColumns: string[] = ['userName', 'nombre', 'rol', 'telefono', 'email', 'estatus', 'opciones'];


  readonly DEFAULT_IMAGE = 'assets/imgs/user.png';

  constructor() {
    effect(() => {
      this.dataSource.data = this.users();
    });

    afterNextRender(() => {
      this.dataSource.sort = this.sort();
      this.dataSource.paginator = this.paginator();
    });

    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'userName': return item.userName.toLowerCase(); // Corrección no filtraba por userName
        default: return (item as any)[property];
      }
    };


    this.dataSource.filterPredicate = (data: UserListItem, filter: string) =>
      data.userName.toLowerCase().includes(filter) ||
      data.nombre.toLowerCase().includes(filter);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    this.dataSource.paginator?.firstPage();
  }

  handleImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = this.DEFAULT_IMAGE;
  }

}
