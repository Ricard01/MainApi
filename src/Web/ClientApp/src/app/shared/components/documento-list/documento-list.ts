import {ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input, output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatTableModule} from '@angular/material/table';
import {MatSortModule, Sort} from '@angular/material/sort';
import {MatPaginatorModule, PageEvent} from '@angular/material/paginator';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {RouterLink} from '@angular/router';
import {debounceTime, distinctUntilChanged} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {
  DocumentoColumnConfig,
  DocumentoListAction,
  DocumentoListConfig,
  DocumentoListItem,
  DocumentoListQuery,
  DocumentoStatus,
  SortDirection
} from '../../models/documento-list.model';

@Component({
  selector: 'app-documento-list',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './documento-list.html',
  styleUrl: './documento-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentoList {
  private readonly destroyRef = inject(DestroyRef);

  readonly config = input.required<DocumentoListConfig>();
  readonly items = input.required<DocumentoListItem[]>();
  readonly totalCount = input.required<number>();
  readonly query = input.required<DocumentoListQuery>();
  readonly loading = input(false);
  readonly queryChange = output<DocumentoListQuery>();
  readonly itemAction = output<DocumentoListAction>();

  readonly filters = new FormGroup({
    search: new FormControl('', {nonNullable: true}),
    dateFrom: new FormControl('', {nonNullable: true}),
    dateTo: new FormControl('', {nonNullable: true}),
    status: new FormControl<DocumentoStatus>('', {nonNullable: true}),
  });

  constructor() {
    effect(() => {
      const query = this.query();
      this.filters.patchValue({
        search: query.search,
        dateFrom: query.dateFrom,
        dateTo: query.dateTo,
        status: query.status,
      }, {emitEvent: false});
    });

    this.filters.controls.search.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(search => this.emitQuery({search: search.trim(), page: 1}));

    this.filters.controls.dateFrom.valueChanges.pipe(
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(dateFrom => this.emitQuery({dateFrom, page: 1}));

    this.filters.controls.dateTo.valueChanges.pipe(
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(dateTo => this.emitQuery({dateTo, page: 1}));

    this.filters.controls.status.valueChanges.pipe(
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(status => this.emitQuery({status, page: 1}));
  }

  get displayedColumns(): string[] {
    return [...this.config().columns.map(column => column.key), 'actions'];
  }

  onSortChange(sort: Sort): void {
    if (!sort.direction) return;
    this.emitQuery({
      sortBy: sort.active,
      sortDirection: sort.direction as SortDirection,
      page: 1,
    });
  }

  onPageChange(page: PageEvent): void {
    this.emitQuery({page: page.pageIndex + 1, pageSize: page.pageSize});
  }

  runAction(action: DocumentoListAction['action'], item: DocumentoListItem): void {
    this.itemAction.emit({action, item});
  }

  value(item: DocumentoListItem, column: DocumentoColumnConfig): string | number {
    if (column.key === 'serieFolio') {
      return `${item.serie}${item.folio}`;
    }

    return item[column.key];
  }

  statusLabel(status: DocumentoListItem['estado']): string {
    return status === 'facturada' ? 'Facturada' : 'Pendiente';
  }

  private emitQuery(patch: Partial<DocumentoListQuery>): void {
    this.queryChange.emit({...this.query(), ...patch});
  }
}
