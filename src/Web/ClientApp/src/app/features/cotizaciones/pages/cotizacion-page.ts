import {ChangeDetectionStrategy, Component, DestroyRef, inject, signal, viewChild} from '@angular/core';
import {CotizacionHeader} from '../components/cotizacion-header/cotizacion-header';
import {CotizacionDetail} from '../components/cotizacion-detail/cotizacion-detail';
import {Router} from '@angular/router';
import {MatIcon} from '@angular/material/icon';
import {CotizacionApi} from '../data-acces/cotizacion.api';
import {CreateCotizacionCommand} from '../data-acces/cotizacion.model';
import {SnackbarService} from '../../../shared/services/snackbar.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatDialog} from '@angular/material/dialog';
import {CotizacionPreview} from '../components/cotizacion-preview/cotizacion-preview';
import {CotizacionPreviewData} from '../components/cotizacion-preview/cotizacion-preview.model';
import {AuthFacade} from '../../../core/auth/data-access/state/auth.facade';


@Component({
  selector: 'app-cotizacion-page',
  imports: [CotizacionHeader, CotizacionDetail, MatIcon],
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

    <app-cotizacion-header
      (personaMoralChange)="isPersonaMoral.set($event)">
    </app-cotizacion-header>

    <app-cotizacion-detail
      [isPersonaMoral]="isPersonaMoral()"
      [actionsDisabled]="!isHeaderValid()"
      (vistaPrevia)="onVistaPrevia()"
      (guardar)="onGuardar()">
    </app-cotizacion-detail>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CotizacionPage {
  readonly isPersonaMoral = signal(true);
  private readonly router = inject(Router);
  private readonly cotizacionApi = inject(CotizacionApi);
  private readonly snackbar = inject(SnackbarService);
  private readonly dialog = inject(MatDialog);
  private readonly auth = inject(AuthFacade);
  private readonly destroyRef = inject(DestroyRef);
  private readonly header = viewChild(CotizacionHeader);
  private readonly detail = viewChild.required(CotizacionDetail);

  onRegresar() {
    this.router.navigate(['/cotizaciones']);
  }

  isHeaderValid(): boolean {
    return this.header()?.isValid() ?? false;
  }

  onGuardar(): void {
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

    this.cotizacionApi.create(command)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.snackbar.success('Cotización guardada correctamente');
          this.router.navigate(['/cotizaciones']);
        },
        error: () => {
          this.snackbar.error('No fue posible guardar la cotización');
        }
      });
  }

  onVistaPrevia(): void {
    const header = this.header();
    const detail = this.detail();
    const usuario = this.auth.user();

    if (!header || !header.isValid() || !detail.isValid()) {
      header?.markAsTouched();
      detail.markAsTouched();
      this.snackbar.error('Completa los datos requeridos para generar la vista previa');
      return;
    }

    const data: CotizacionPreviewData = {
      header: header.getValue(),
      detalles: detail.getDetallesValue(),
      resumen: detail.getResumenValue(),
      usuarioNombre: usuario?.nombre ?? '',
      usuarioEmail: usuario?.email ?? '',
      usuarioTelefono: usuario?.telefono ?? '',
    };

    this.dialog.open(CotizacionPreview, {
      data,
      width: 'min(1180px, 96vw)',
      maxWidth: '96vw',
      height: '92vh',
      maxHeight: '92vh',
      autoFocus: false,
      restoreFocus: true,
      panelClass: 'cotizacion-preview-dialog',
    });
  }

  private buildCreateCommand(): CreateCotizacionCommand {
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
      id: 0,
      fecha: header.fecha,
      serie: header.serie,
      folio: Number(header.folio) || 0,
      idAgente: header.idAgente,
      isPersonaMoral: header.isPersonaMoral,
      cliente: header.cliente,
      contacto: header.contacto,
      email: header.email,
      telefono: header.telefono,
      productos,
      totalProductos: resumen.productos,
      total: resumen.total,
    };
  }
}
