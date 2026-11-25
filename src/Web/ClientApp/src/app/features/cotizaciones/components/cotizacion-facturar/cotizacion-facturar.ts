import {ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {takeUntilDestroyed, toSignal} from '@angular/core/rxjs-interop';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatAutocompleteModule, MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {CotizacionApi} from '../../data-acces/cotizacion.api';
import {CotizacionFacturada, CotizacionReadModel} from '../../data-acces/cotizacion.model';
import {ClienteApi} from '../../../../shared/services/cliente.api';
import {Cliente} from '../../../../shared/models/cliente.model';

export interface CotizacionFacturarData {
  cotizacion: CotizacionReadModel;
}

/**
 * Convierte la cotización en una factura sin timbrar tal cual está. Lo único que puede cambiarse es el cliente;
 * partidas, precios, descuentos y textos se copian de la cotización.
 */
@Component({
  selector: 'app-cotizacion-facturar',
  standalone: true,
  imports: [
    MatDialogModule, MatButtonModule, MatIconModule, MatAutocompleteModule, MatFormFieldModule,
    MatInputModule, MatProgressSpinnerModule,
  ],
  templateUrl: './cotizacion-facturar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CotizacionFacturar {
  private readonly data = inject<CotizacionFacturarData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject<MatDialogRef<CotizacionFacturar, CotizacionFacturada>>(MatDialogRef);
  private readonly cotizacionApi = inject(CotizacionApi);
  private readonly clienteApi = inject(ClienteApi);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly cotizacion = this.data.cotizacion;

  protected readonly clientes = toSignal(this.clienteApi.getAll(), {initialValue: [] as Cliente[]});
  protected readonly busquedaCliente = signal('');
  protected readonly clienteSeleccionado = signal<Cliente>({
    id: this.cotizacion.idCliente,
    codigo: this.cotizacion.clienteCodigo,
    razonSocial: this.cotizacion.clienteRazonSocial,
  });

  protected readonly clientesFiltrados = computed(() => {
    const texto = this.busquedaCliente().trim().toLowerCase();
    if (!texto) return this.clientes().slice(0, 50);

    return this.clientes()
      .filter(c => c.codigo.toLowerCase().includes(texto) || c.razonSocial.toLowerCase().includes(texto))
      .slice(0, 50);
  });

  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected nombreCliente(cliente: Cliente | string | null): string {
    if (!cliente || typeof cliente === 'string') return cliente ?? '';
    return `${cliente.codigo} · ${cliente.razonSocial}`;
  }

  protected onBuscarCliente(texto: string): void {
    this.busquedaCliente.set(texto);
  }

  protected onClienteSeleccionado(event: MatAutocompleteSelectedEvent): void {
    this.clienteSeleccionado.set(event.option.value as Cliente);
    this.busquedaCliente.set('');
  }

  protected convertir(): void {
    if (this.guardando()) return;

    const cliente = this.clienteSeleccionado();
    this.guardando.set(true);
    this.error.set(null);

    this.cotizacionApi.facturar({
      idCotizacion: this.cotizacion.id,
      idCliente: cliente.id === this.cotizacion.idCliente ? null : cliente.id,
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: factura => this.dialogRef.close(factura),
        error: (respuesta: HttpErrorResponse) => {
          this.guardando.set(false);
          this.error.set(this.mensajeError(respuesta));
        },
      });
  }

  protected cancelar(): void {
    this.dialogRef.close();
  }

  private mensajeError(respuesta: HttpErrorResponse): string {
    const problema = respuesta.error as { detail?: string; title?: string; errors?: Record<string, string[]> } | null;
    const validaciones = Object.values(problema?.errors ?? {}).flat();
    if (validaciones.length > 0) return validaciones.join(' ');
    return problema?.detail ?? problema?.title ?? 'No fue posible convertir la cotización en factura.';
  }
}
