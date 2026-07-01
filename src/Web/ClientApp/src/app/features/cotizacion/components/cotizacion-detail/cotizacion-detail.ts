import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {NonNullableFormBuilder} from '@angular/forms';
import {ProductoAutocomplete} from '../../../../shared/components/producto-autocomplete';
import {Producto} from '../../../../shared/models/producto.model';

@Component({
  selector: 'app-cotizacion-detail',
  imports: [ProductoAutocomplete],
  templateUrl: './cotizacion-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CotizacionDetail {

  private readonly fb = inject(NonNullableFormBuilder);

  readonly form = this.fb.group({
    codigo: '',
    producto: '',
    cantidad: '',
    unidad: '',
    precio: '',
    subtotal: '',
    total: '',
  });

  onProductoSeleccionado(producto: Producto | null) {
    this.form.controls.codigo.setValue(producto?.codigo!);
    this.form.controls.producto.setValue(producto?.nombre!);
  }

}
