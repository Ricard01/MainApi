import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input, output,
  viewChild
} from '@angular/core';
import {Permiso, RolListItem} from '../../data-acces/rol.model';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {RouterModule} from '@angular/router';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {SnackbarService} from '../../../../shared/services/snackbar.service';
import {MatFormFieldModule} from '@angular/material/form-field';


@Component({
  selector: 'app-rol-list',
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    RouterModule,
    MatDialogModule
  ],
  templateUrl: './rol-list.html',
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolList {

  public roles = input.required<RolListItem[]>();


  // private dialog = inject(MatDialog);
  // private snackbar = inject(SnackbarService)
  delete = output<RolListItem>();

  private sort = viewChild.required(MatSort);
  private paginator = viewChild.required(MatPaginator);
  dataSource = new MatTableDataSource<RolListItem>();
  displayedColumns: string[] = ['nombre', 'descripcion', 'opciones'];

  constructor() {
    effect(() => {
      this.dataSource.data = this.roles();
    });

    afterNextRender(() => {
      this.dataSource.sort = this.sort();
      this.dataSource.paginator = this.paginator();
    });

    this.dataSource.filterPredicate = (data: RolListItem, filter: string) =>

      data.nombre.toLowerCase().includes(filter);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    this.dataSource.paginator?.firstPage();
  }

  onDelete(rol: RolListItem) {
    const confirmed = confirm(`¿Estás seguro de que deseas eliminar a ${rol.nombre}?`);
    if (confirmed) {
      this.delete.emit(rol);
    }
  }

}
