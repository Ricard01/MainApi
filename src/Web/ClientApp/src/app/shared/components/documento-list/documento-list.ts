import {ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input, output, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatTableModule} from '@angular/material/table';
import {MatSortModule, Sort} from '@angular/material/sort';
import {MatPaginatorModule, PageEvent} from '@angular/material/paginator';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
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
  readonly showAdvancedFilters = signal(false);

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

      if (query.dateFrom || query.dateTo || query.status) {
        this.showAdvancedFilters.set(true);
      }
    });

    this.filters.controls.search.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(search => this.emitQuery({search: search.trim(), page: 1}));

    this.filters.controls.status.valueChanges.pipe(
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(status => this.emitQuery({status, page: 1}));
  }

  get displayedColumns(): string[] {
    return [...this.config().columns.map(column => column.key), 'actions'];
  }

  get hasActiveAdvancedFilters(): boolean {
    const {dateFrom, dateTo, status} = this.filters.getRawValue();
    return Boolean(dateFrom || dateTo || status);
  }

  toggleAdvancedFilters(): void {
    this.showAdvancedFilters.update(show => !show);
  }

  onDateChange(controlName: 'dateFrom' | 'dateTo', event: Event): void {
    const input = event.target as HTMLInputElement;

    // Al escribir "20" como inicio de "2026", algunos navegadores generan
    // temporalmente el año 0020. El mínimo del input lo mantiene inválido
    // hasta que el usuario termina un año razonable de cuatro dígitos.
    if (!input.validity.valid) return;

    const value = input.value;
    if (value !== '' && !/^\d{4}-\d{2}-\d{2}$/.test(value)) return;

    this.emitQuery({[controlName]: value, page: 1});
  }

  clearAdvancedFilters(): void {
    this.filters.patchValue({dateFrom: '', dateTo: '', status: ''}, {emitEvent: false});
    this.emitQuery({dateFrom: '', dateTo: '', status: '', page: 1});
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
