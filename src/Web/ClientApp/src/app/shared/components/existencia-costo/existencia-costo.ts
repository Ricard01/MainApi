import {ChangeDetectionStrategy, Component, inject, signal,} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatDialogRef} from '@angular/material/dialog';
import {OverlayModule} from '@angular/cdk/overlay';
import {ReactiveFormsModule, Validators, NonNullableFormBuilder,} from '@angular/forms';
import {toSignal} from '@angular/core/rxjs-interop';
import {AlmacenApi} from '../../services/almacen.api';
import {Producto} from '../../models/producto.model';
import {AlmacenSelect} from '../almacen-select';
import {ExistenciaApi} from '../../services/existencia.api';
import {ExistenciaCosto} from '../../models/existencia-costo.model';
import {ProductoAutocomplete} from '../producto-autocomplete/producto-autocomplete';

@Component({
  selector: 'app-existencia-costo',
  imports: [CommonModule, OverlayModule, ReactiveFormsModule, AlmacenSelect, ProductoAutocomplete],
  templateUrl: './existencia-costo.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ExistenciaComponent {

  private readonly dialogRef = inject(MatDialogRef<ExistenciaComponent>);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly existenciaApi = inject(ExistenciaApi)
  private readonly almacenApi = inject(AlmacenApi);

  readonly resultado = signal<ExistenciaCosto | null>(null);
  readonly productoSeleccionado = signal<Producto | null>(null);
  readonly almacenes = toSignal(this.almacenApi.getAll(), {initialValue: []});

  form = this.fb.group({
    idAlmacen: [1, Validators.required],
    producto: this.fb.control<Producto | null>(null, Validators.required),
  });


  onAlmacenSeleccionado(id: number): void {
    this.form.controls.idAlmacen.setValue(id);
    this.resultado.set(null);
  }

  onProductoSeleccionado(producto: Producto | null): void {
    this.form.controls.producto.setValue(producto);
    this.productoSeleccionado.set(producto);
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
