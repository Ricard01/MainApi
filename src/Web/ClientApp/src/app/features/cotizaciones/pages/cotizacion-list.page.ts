import {ChangeDetectionStrategy, Component, DestroyRef, inject, signal} from '@angular/core';
import {CotizacionList} from '../components/cotizacion-list/cotizacion-list';
import {ActivatedRoute, Router} from '@angular/router';
import {catchError, distinctUntilChanged, map, of, switchMap, tap} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {CotizacionApi} from '../data-acces/cotizacion.api';
import {
  DEFAULT_DOCUMENTO_LIST_QUERY,
  DocumentoListAction,
  DocumentoListQuery,
  DocumentoStatus,
  PaginatedResponse,
  DocumentoListItem,
  SortDirection
} from '../../../shared/models/documento-list.model';
import {SnackbarService} from '../../../shared/services/snackbar.service';
import {MatDialog} from '@angular/material/dialog';
import {AuthFacade} from '../../../core/auth/data-access/state/auth.facade';
import {CotizacionPreview} from '../components/cotizacion-preview/cotizacion-preview';
import {CotizacionPreviewData} from '../components/cotizacion-preview/cotizacion-preview.model';
import {CotizacionReadModel} from '../data-acces/cotizacion.model';

@Component({
  selector: 'app-cotizacion-list-page',
  imports:[CotizacionList],
  template:`
    <app-cotizacion-list
      [items]="response().items"
      [totalCount]="response().totalCount"
      [query]="query()"
      [loading]="loading()"
      (queryChange)="onQueryChange($event)"
      (itemAction)="onItemAction($event)">
    </app-cotizacion-list>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class CotizacionListPage {
  private readonly api = inject(CotizacionApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackbar = inject(SnackbarService);
  private readonly dialog = inject(MatDialog);
  private readonly auth = inject(AuthFacade);
  private readonly destroyRef = inject(DestroyRef);

  readonly query = signal<DocumentoListQuery>(this.parseQuery());
  readonly loading = signal(false);
  readonly response = signal<PaginatedResponse<DocumentoListItem>>({
    items: [],
    pageNumber: 1,
    pageSize: 25,
    totalPages: 0,
    totalCount: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  });

  constructor() {
    this.route.queryParamMap.pipe(
      map(() => this.parseQuery()),
      distinctUntilChanged((previous, current) => JSON.stringify(previous) === JSON.stringify(current)),
      tap(query => {
        this.query.set(query);
        this.loading.set(true);
      }),
      switchMap(query => this.api.list(query).pipe(
        catchError(() => {
          this.snackbar.error('No fue posible consultar las cotizaciones');
          return of({...this.response(), items: [], totalCount: 0, totalPages: 0});
        })
      )),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(response => {
      this.response.set(response);
      this.loading.set(false);
    });
  }

  onQueryChange(query: DocumentoListQuery): void {
    this.router.navigate([], {
      relativeTo: this.route,
      replaceUrl: true,
      queryParams: {
        page: query.page === 1 ? null : query.page,
        pageSize: query.pageSize === 25 ? null : query.pageSize,
        search: query.search || null,
        sortBy: query.sortBy === 'fecha' ? null : query.sortBy,
        sortDirection: query.sortDirection === 'desc' ? null : query.sortDirection,
        dateFrom: query.dateFrom || null,
        dateTo: query.dateTo || null,
        status: query.status || null,
      },
    });
  }

  onItemAction(event: DocumentoListAction): void {
    switch (event.action) {
      case 'edit':
      case 'duplicate':
        this.snackbar.info('Esta acción requiere definir las reglas de modificación del documento');
        break;
      case 'preview':
        this.openStoredCotizacion(event.item.id, false);
        break;
      case 'pdf':
        this.openStoredCotizacion(event.item.id, true);
        break;
    }
  }

  private openStoredCotizacion(id: number, descargarAlAbrir: boolean): void {
    this.api.getById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: cotizacion => this.openPreview(cotizacion, descargarAlAbrir),
        error: () => this.snackbar.error('No fue posible cargar la cotización'),
      });
  }

  private openPreview(cotizacion: CotizacionReadModel, descargarAlAbrir: boolean): void {
    const usuario = this.auth.user();
    const resumen = cotizacion.productos.reduce((total, producto) => ({
      productos: total.productos + 1,
      subtotal: total.subtotal + producto.neto,
      descuento: total.descuento + producto.descuento,
      iva: total.iva + producto.iva,
      isr: total.isr + producto.isr,
      total: total.total + producto.total,
    }), {productos: 0, subtotal: 0, descuento: 0, iva: 0, isr: 0, total: 0});
    const data: CotizacionPreviewData = {
      header: {
        isPersonaMoral: cotizacion.isPersonaMoral,
        idAgente: cotizacion.idAgente,
        agente: '',
        cliente: cotizacion.cliente,
        fecha: this.formatDate(cotizacion.fecha),
        serie: cotizacion.serie,
        folio: String(cotizacion.folio),
        contacto: cotizacion.contacto,
        email: cotizacion.email,
        telefono: cotizacion.telefono,
        observaciones: cotizacion.observaciones,
      },
      detalles: cotizacion.productos,
      resumen,
      usuarioNombre: cotizacion.usuarioNombre,
      usuarioEmail: usuario?.email ?? '',
      usuarioTelefono: usuario?.telefono ?? '',
      descargarAlAbrir,
    };

    this.dialog.open(CotizacionPreview, {
      data,
      width: 'min(1180px, 96vw)',
      maxWidth: '96vw',
      height: '92vh',
      maxHeight: '92vh',
      autoFocus: false,
      restoreFocus: true,
      panelClass: descargarAlAbrir
        ? ['cotizacion-preview-dialog', 'cotizacion-pdf-render-dialog']
        : 'cotizacion-preview-dialog',
      hasBackdrop: !descargarAlAbrir,
      disableClose: descargarAlAbrir,
    });
  }

  private formatDate(value: string): string {
    const [year, month, day] = value.slice(0, 10).split('-');
    return year && month && day ? `${day}/${month}/${year}` : value;
  }

  private parseQuery(): DocumentoListQuery {
    const params = this.route.snapshot.queryParamMap;
    const page = this.positiveInteger(params.get('page'), DEFAULT_DOCUMENTO_LIST_QUERY.page);
    const requestedPageSize = this.positiveInteger(params.get('pageSize'), DEFAULT_DOCUMENTO_LIST_QUERY.pageSize);
    const pageSize = [25, 50, 100].includes(requestedPageSize) ? requestedPageSize : 25;
    const direction = params.get('sortDirection') === 'asc' ? 'asc' : 'desc';
    const status = params.get('status');

    return {
      page,
      pageSize,
      search: params.get('search')?.trim() ?? '',
      sortBy: params.get('sortBy') || DEFAULT_DOCUMENTO_LIST_QUERY.sortBy,
      sortDirection: direction as SortDirection,
      dateFrom: params.get('dateFrom') ?? '',
      dateTo: params.get('dateTo') ?? '',
      status: status === 'pendiente' || status === 'facturada' ? status as DocumentoStatus : '',
    };
  }

  private positiveInteger(value: string | null, fallback: number): number {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
  }

}
