import {ChangeDetectionStrategy, Component, DestroyRef, inject, signal, viewChild} from '@angular/core';
import {CotizacionHeader} from '../components/cotizacion-header/cotizacion-header';
import {CotizacionDetail} from '../components/cotizacion-detail/cotizacion-detail';
import {Router} from '@angular/router';
import {MatIcon} from '@angular/material/icon';
import {CotizacionApi} from '../data-acces/cotizacion.api';
import {CreateCotizacionCommand} from '../data-acces/cotizacion.model';
import {SnackbarService} from '../../../shared/services/snackbar.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';


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

  private buildCreateCommand(): CreateCotizacionCommand {
    const header = this.header()!.getValue();
    const resumen = this.detail().getResumenValue();
    const productos = this.detail().getDetallesValue().map(detalle => ({
      idProducto: detalle.idProducto,
      idUnidadMedida: detalle.idUnidad ?? 0,
      cantidad: detalle.cantidad,
      precio: detalle.precio,
      observacion: detalle.observaciones,
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
