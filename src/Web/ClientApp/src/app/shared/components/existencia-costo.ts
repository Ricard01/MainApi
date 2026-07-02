import {ChangeDetectionStrategy, Component, inject, signal,} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatDialogRef} from '@angular/material/dialog';
import {OverlayModule} from '@angular/cdk/overlay';
import {ReactiveFormsModule, Validators, NonNullableFormBuilder,} from '@angular/forms';
import {toSignal} from '@angular/core/rxjs-interop';
import {AlmacenApi} from '../services/almacen.api';
import {ProductoAutocomplete} from './producto-autocomplete';
import {Producto} from '../models/producto.model';
import {AlmacenSelect} from './almacen-select';
import {ExistenciaApi} from '../services/existencia.api';
import {ExistenciaCosto} from '../models/existencia-costo.model';
import {TipoProducto} from '../enums/producto.enum';
import {EstatusCONTPAQi} from '../enums/EstatusCONTPAQi.enum';

@Component({
  selector: 'app-existencia-costo',
  imports: [CommonModule, OverlayModule, ReactiveFormsModule, AlmacenSelect, ProductoAutocomplete],
  template: `
    <div class="bg-surface text-on-surface min-w-112.5 p-6 rounded-lg shadow-xl">

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
          (enterPressed)="consultar()"
          (productoSeleccionado)="onProductoSeleccionado($event)">
        </producto-autocomplete>

        @if (resultado(); as res) {
          <div
            class="p-6 rounded-lg bg-primary/5 border border-primary/20 flex flex-col sm:flex-row justify-around items-center gap-6 text-center"
            role="status">

            <div class="flex flex-col">
              <span class="text-xs font-semibold uppercase tracking-wider opacity-70 mb-1">Existencia</span>
              <span class="text-2xl font-black text-primary">
      {{ res.existencia | number:'1.0-2' }}
    </span>
            </div>

            <div class="hidden sm:block w-px h-12 bg-primary/20"></div>

            <div class="flex flex-col">
              <span class="text-xs font-semibold uppercase tracking-wider opacity-70 mb-1">Costo Promedio</span>
              <span class="text-2xl font-black text-primary">
      {{ res.costoPromedio | currency:'MXN':'$':'1.2-2' }}
    </span>
            </div>

            <div class="hidden sm:block w-px h-12 bg-primary/20"></div>

            <div class="flex flex-col">
              <span class="text-xs font-semibold uppercase tracking-wider opacity-70 mb-1">Último Costo</span>
              <span class="text-2xl font-black text-primary">
      {{ res.ultimoCosto | currency:'MXN':'$':'1.2-2' }}
    </span>
            </div>

          </div>
        }

        <!-- Acciones -->
        <div class="flex justify-end gap-3 pt-4">

          <button type="button" (click)="close()"
                  class="px-4 py-2 text-sm font-medium hover:bg-surface-variant rounded-md transition-colors">
            Cancelar
          </button>

          <button type="button" [disabled]="form.invalid || buscando()" (click)="consultar()"
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ExistenciaComponent {
  private readonly dialogRef = inject(MatDialogRef<ExistenciaComponent>);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly existenciaApi = inject(ExistenciaApi)
  private readonly almacenApi = inject(AlmacenApi);
  protected readonly EstatusCONTPAQi = EstatusCONTPAQi;
  protected readonly TipoProducto = TipoProducto;

  readonly buscando = signal(false);
  readonly resultado = signal<ExistenciaCosto | null>(null);

  readonly almacenes = toSignal(this.almacenApi.getAll(), {initialValue: []});

  form = this.fb.group({
    idAlmacen: [1, Validators.required],
    producto: this.fb.control<Producto | null>(null, Validators.required)
  });


  onAlmacenSeleccionado(id: number): void {
    this.form.controls.idAlmacen.setValue(id);
    this.resultado.set(null);
  }

  onProductoSeleccionado(producto: Producto | null): void {
    this.form.controls.producto.setValue(producto);
    this.resultado.set(null);
  }

  consultar() {
    if (this.form.invalid) return;

    const {idAlmacen, producto} = this.form.getRawValue();
    if (!producto || idAlmacen == null) return;

    this.existenciaApi.getExistenciaCosto(producto.id, idAlmacen).subscribe({
      next: (existencia) => {
        this.resultado.set(existencia);
      },
      error: (err) => {
        console.error('Error al consultar saldo', err);

      }
    });
  }

  close(): void {
    this.dialogRef.close();
  }


}
