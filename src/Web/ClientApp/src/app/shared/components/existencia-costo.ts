import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import { OverlayModule, ConnectionPositionPair } from '@angular/cdk/overlay';
import {
  ReactiveFormsModule,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs/operators';
import { AlmacenApi } from '../services/almacen.api';
import { ProductoApi } from '../services/producto.api';
import { ProductoAutocomplete } from './producto-autocomplete';
import { Producto } from '../models/producto.model';
import { AlmacenSelect } from './almacen-select';

@Component({
  selector: 'app-existencia-costo',
  imports: [
    CommonModule,
    OverlayModule,
    ReactiveFormsModule,
    AlmacenSelect,
    ProductoAutocomplete,
  ],
  template: `
    <div class="bg-surface text-on-surface min-w-[450px] p-6 rounded-lg shadow-xl">

      <!-- Header -->
      <div class="flex justify-between items-center mb-6 border-b border-outline-variant pb-3">
        <h1 class="text-xl font-bold text-primary">Consultar Existencia</h1>

        <button (click)="close()" class="text-on-surface-variant hover:text-error transition-colors"
                aria-label="Cerrar">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <form [formGroup]="form" class="flex flex-col gap-5">

        <almacen-select
          [almacenes]="almacenes()"
          [selectedId]="form.controls.idAlmacen.value"
          (almacenSeleccionado)="onAlmacenSeleccionado($event)">
        </almacen-select>

        <producto-autocomplete
          (productoSeleccionado)="onProductoSeleccionado($event)">
        </producto-autocomplete>

        @if (resultado(); as res) {
          <div
            class="p-4 rounded-md bg-primary/5 border border-primary/20 flex justify-between items-center"
            role="status">
            <span class="text-sm font-medium">Stock disponible:</span>
            <span class="text-2xl font-black text-primary">{{ res }}</span>
          </div>
        }

        <!-- Acciones -->
        <div class="flex justify-end gap-3 pt-4">

          <button type="button" (click)="close()"
                  class="px-4 py-2 text-sm font-medium hover:bg-surface-variant rounded-md transition-colors">
            Cancelar
          </button>

          <button
            type="button"
            [disabled]="form.invalid || buscando()"
            (click)="consultar()"
            class="px-6 py-2 text-sm font-medium bg-primary text-on-primary rounded-md shadow-md hover:bg-primary/90 transition-all disabled:opacity-50">

            @if (buscando()) {
              <span>Consultando...</span>
            } @else {
              <span>Consultar</span>
            }
          </button>

        </div>

      </form>
    </div>
  `,
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExistenciaComponent {
  private readonly dialogRef = inject(MatDialogRef<ExistenciaComponent>);

  private readonly almacenApi = inject(AlmacenApi);


  readonly buscando = signal(false);
  readonly resultado = signal<number | null>(null);

  // Carga de datos inicial (Almacenes y Productos)
  readonly almacenes = toSignal(this.almacenApi.getAll(), { initialValue: [] });

  // Formulario Reactivo (idAlmacen por defecto en 1)
  readonly form = new FormGroup({
    idAlmacen: new FormControl<number>(1, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    producto: new FormControl<Producto | null>(null, [Validators.required]),
  });

  onAlmacenSeleccionado(id: number): void {
    this.form.controls.idAlmacen.setValue(id);
    this.resultado.set(null); // Limpiamos el resultado si cambian de almacén
  }
  onProductoSeleccionado(producto: Producto | null): void {
    this.form.controls.producto.setValue(producto);
    this.resultado.set(null); // Limpiamos el resultado si cambian de producto
  }

  consultar() {
    if (this.form.invalid) return;

    const { idAlmacen, producto } = this.form.getRawValue();
    if (!producto) return;

    this.buscando.set(true);

    // Llamada real a tu API de existencias
    // this.existenciaApi.getSaldo(idAlmacen, selectedProducto.id).subscribe({
    //   next: (stock) => {
    //     this.resultado.set(stock);
    //     this.buscando.set(false);
    //   },
    //   error: (err) => {
    //     console.error('Error al consultar saldo', err);
    //     this.buscando.set(false);
    //   }
    // });
  }

  close(): void {
    this.dialogRef.close();
  }
}
