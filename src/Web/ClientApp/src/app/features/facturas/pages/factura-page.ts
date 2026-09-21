import {ChangeDetectionStrategy, Component, DestroyRef, inject, signal, viewChild} from '@angular/core';
import {FacturaHeader} from '../components/factura-header/factura-header';
import {FacturaDetail} from '../components/factura-detail/factura-detail';
import {ActivatedRoute, Router} from '@angular/router';
import {MatIcon} from '@angular/material/icon';
import {FacturaApi} from '../data-acces/factura.api';
import {SnackbarService} from '../../../shared/services/snackbar.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatDialog} from '@angular/material/dialog';
import {FacturaPreview} from '../components/factura-preview/factura-preview';

import {AuthFacade} from '../../../core/auth/data-access/state/auth.facade';
import {FacturaPreviewData} from '../components/factura-preview/factura-preview.model';
import {CreateFacturaCommand} from '../data-acces/factura.model';


@Component({
  selector: 'app-factura-page',
  imports: [FacturaHeader, FacturaDetail, MatIcon],
  template: `
    <div class="mb-3">
      <button type="button" (click)="onRegresar()"
        class="inline-flex items-center gap-1.5 text-sm font-medium text-on-surface-variant/75 hover:text-primary transition-colors duration-250 bg-transparent border-none p-0 cursor-pointer group">
        <mat-icon class="text-base h-5 w-5 flex items-center justify-center transform group-hover:-translate-x-0.5 transition-transform">
          arrow_back
        </mat-icon>
          Cotizaciones
      </button>
    </div>

    <app-factura-header
      [editMode]="isEditMode()"
      [readOnly]="readOnly()"
      [status]="status()"
      (personaMoralChange)="isPersonaMoral.set($event)">
    </app-factura-header>

    <app-factura-detail
      [isPersonaMoral]="isPersonaMoral()"
      [readOnly]="readOnly()"
      [showDelete]="isEditMode() && !readOnly()"
      [actionsDisabled]="!isHeaderValid()"
      (cancelar)="onRegresar()"
      (eliminar)="onEliminar()"
      (vistaPrevia)="onVistaPrevia()"
      (descargarPdf)="onDescargarPdf()"
      (guardar)="onGuardar()">
    </app-factura-detail>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FacturaPage {
  readonly isPersonaMoral = signal(true);
  readonly currentId = signal<number | null>(null);
  readonly readOnly = signal(false);
  readonly status = signal<'pendiente' | 'facturada'>('pendiente');
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly cotizacionApi = inject(FacturaApi);
  private readonly snackbar = inject(SnackbarService);
  private readonly dialog = inject(MatDialog);
  private readonly auth = inject(AuthFacade);
  private readonly destroyRef = inject(DestroyRef);
  private readonly header = viewChild(FacturaHeader);
  private readonly detail = viewChild.required(FacturaDetail);

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (Number.isInteger(id) && id > 0) {
      this.currentId.set(id);
      this.loadCotizacion(id);
    }
  }

  isEditMode(): boolean {
    return this.currentId() !== null;
  }

  onRegresar() {
    this.router.navigate(['/cotizaciones']);
  }

  isHeaderValid(): boolean {
    return this.header()?.isValid() ?? false;
  }

  onGuardar(): void {
    if (this.readOnly()) return;

    const header = this.header();
    const detail = this.detail();

    if (!header) return;

    if (!header.isValid() || !detail.isValid()) {
      header.markAsTouched();
      detail.markAsTouched();
      this.snackbar.error('Revisa los datos de la cotización antes de guardar');
      return;
    }

    const command = this.buildCreateCommand();

    const request = this.currentId() === null
      ? this.cotizacionApi.create(command)
      : this.cotizacionApi.update(this.currentId()!, command);

    request
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.snackbar.success(this.isEditMode()
            ? 'Cotización actualizada correctamente'
            : 'Cotización guardada correctamente');
          this.router.navigate(['/cotizaciones']);
        },
        error: () => {
          this.snackbar.error('No fue posible guardar la cotización');
        }
      });
  }

  onEliminar(): void {
    const id = this.currentId();
    if (id === null || this.readOnly()) return;
    if (!confirm('¿Eliminar esta cotización? Esta acción no se puede deshacer.')) return;

    this.cotizacionApi.delete(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.snackbar.success('Cotización eliminada correctamente');
          this.router.navigate(['/cotizaciones']);
        },
        error: () => this.snackbar.error('No se puede eliminar una cotización facturada'),
      });
  }

  onVistaPrevia(): void {
    this.openPreview(false);
  }

  onDescargarPdf(): void {
    this.openPreview(true);
  }

  private openPreview(descargarAlAbrir: boolean): void {
    const header = this.header();
    const detail = this.detail();
    const usuario = this.auth.user();

    if (!header || !header.isValid() || !detail.isValid()) {
      header?.markAsTouched();
      detail.markAsTouched();
      this.snackbar.error('Completa los datos requeridos para generar la vista previa');
      return;
    }

    const data: FacturaPreviewData = {
      header: header.getValue(),
      detalles: detail.getDetallesValue(),
      resumen: detail.getResumenValue(),
      usuarioNombre: usuario?.nombre ?? '',
      usuarioEmail: usuario?.email ?? '',
      usuarioTelefono: usuario?.telefono ?? '',
      descargarAlAbrir,
    };

    this.dialog.open(FacturaPreview, {
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

  private buildCreateCommand(): CreateFacturaCommand {
    const header = this.header()!.getValue();
    const resumen = this.detail().getResumenValue();
    const productos = this.detail().getDetallesValue().map(detalle => ({
      idProducto: detalle.idProducto,
      idUnidadMedida: detalle.idUnidad ?? 0,
      cantidad: detalle.cantidad,
      precio: detalle.precio,
      observaciones: detalle.observaciones,
      descuentoPorcentaje: detalle.descuentoPorcentaje,
      descuento: detalle.descuento,
      neto: detalle.neto,
      iva: detalle.iva,
      isr: detalle.isr,
      total: detalle.total,
    }));

    return {
      id: this.currentId() ?? 0,
      fecha: header.fecha,
      serie: header.serie,
      folio: Number(header.folio) || 0,
      idAgente: header.idAgente,
      isPersonaMoral: header.isPersonaMoral,
      cliente: header.cliente,
      contacto: header.contacto,
      email: header.email,
      telefono: header.telefono,
      observaciones: header.observaciones,
      productos,
      totalProductos: resumen.productos,
      total: resumen.total,
    };
  }

  private loadCotizacion(id: number): void {
    this.cotizacionApi.getById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: cotizacion => {
          this.status.set(cotizacion.estado);
          this.readOnly.set(cotizacion.estado === 'facturada');
          this.isPersonaMoral.set(cotizacion.isPersonaMoral);
          this.header()?.setValue(cotizacion);
          this.detail().setDetallesValue(cotizacion.productos.map(producto => ({
            ...producto,
            idUnidad: producto.idUnidad,
          })));

          if (cotizacion.estado === 'facturada') {
            this.snackbar.info('La cotización está facturada y se muestra sólo para consulta');
          }
        },
        error: () => {
          this.snackbar.error('No fue posible cargar la cotización');
          this.router.navigate(['/cotizaciones']);
        }
      });
  }
}
