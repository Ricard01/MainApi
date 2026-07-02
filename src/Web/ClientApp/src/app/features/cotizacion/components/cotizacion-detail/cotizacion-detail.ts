import {ChangeDetectionStrategy, Component, ElementRef, inject, signal, viewChild} from '@angular/core';
import {NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {ProductoAutocomplete} from '../../../../shared/components/producto-autocomplete';
import {Producto} from '../../../../shared/models/producto.model';
import {TipoProducto} from '../../../../shared/enums/producto.enum';
import {OverlayModule, ConnectionPositionPair} from '@angular/cdk/overlay';
import {ProductoApi} from '../../../../shared/services/producto.api';
import {UnidadMedida} from '../../../../shared/models/unidad-medida.model';

@Component({
  selector: 'app-cotizacion-detail',
  imports: [ProductoAutocomplete, ReactiveFormsModule, OverlayModule],
  templateUrl: './cotizacion-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CotizacionDetail {
  protected readonly TipoProducto = TipoProducto;
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly productoApi = inject(ProductoApi);
  private selectedProductoId: number | null = null;
  private readonly unidadTriggerRef = viewChild<ElementRef<HTMLElement>>('unidadTrigger');

  readonly unidades = signal<UnidadMedida[]>([]);
  readonly selectedUnidad = signal<UnidadMedida | null>(null);
  readonly isUnidadMenuOpen = signal(false);
  readonly unidadMenuWidth = signal<number | string>('100%');

  readonly overlayPositions = [
    new ConnectionPositionPair({originX: 'start', originY: 'bottom'}, {overlayX: 'start', overlayY: 'top'}, 0, 4),
    new ConnectionPositionPair({originX: 'start', originY: 'top'}, {overlayX: 'start', overlayY: 'bottom'}, 0, -4)
  ];

  constructor() {
    console.log('CotizacionDetail constructor');
  }

  readonly form = this.fb.group({
    codigo: '',
    producto: '',
    cantidad: 1,
    unidad: '',
    idUnidad: this.fb.control<number | null>(null),
    precio: '',
    subtotal: '',
    total: '',
  });

  onProductoSeleccionado(producto: Producto | null) {
    this.selectedProductoId = producto?.id ?? null;
    this.isUnidadMenuOpen.set(false);
    this.unidades.set([]);
    this.selectedUnidad.set(null);

    this.form.controls.codigo.setValue(producto?.codigo ?? '');
    this.form.controls.producto.setValue(producto?.nombre ?? '');
    this.form.controls.unidad.setValue('');
    this.form.controls.idUnidad.setValue(null);

    if (!producto) return;

    const unidadBase = this.createUnidadBase(producto);
    this.selectUnidad(unidadBase);

    this.productoApi.getUnidadesMedida(producto.id).subscribe({
      next: unidades => {
        if (this.selectedProductoId !== producto.id) return;

        const disponibles = unidades.length > 0 ? unidades : [unidadBase];
        const principal = disponibles.find(unidad => unidad.esPrincipal)
          ?? disponibles.find(unidad => unidad.id === producto.idUnidad)
          ?? disponibles[0];

        this.unidades.set(disponibles);
        this.selectUnidad(principal);
      },
      error: () => {
        if (this.selectedProductoId !== producto.id) return;

        this.unidades.set([unidadBase]);
        this.selectUnidad(unidadBase);
      }
    });
  }

  toggleUnidadMenu(): void {
    if (this.unidades().length === 0) return;

    const trigger = this.unidadTriggerRef();
    if (trigger) {
      this.unidadMenuWidth.set(trigger.nativeElement.offsetWidth);
    }

    this.isUnidadMenuOpen.update(open => !open);
  }

  selectUnidad(unidad: UnidadMedida): void {
    this.selectedUnidad.set(unidad);
    this.form.controls.idUnidad.setValue(unidad.id);
    this.form.controls.unidad.setValue(unidad.abreviatura || unidad.nombre);
    this.isUnidadMenuOpen.set(false);
  }

  private createUnidadBase(producto: Producto): UnidadMedida {
    return {
      id: producto.idUnidad,
      nombre: producto.unidadMedida,
      abreviatura: producto.abrevUnidadMedida,
      esPrincipal: true,
    };
  }


}
