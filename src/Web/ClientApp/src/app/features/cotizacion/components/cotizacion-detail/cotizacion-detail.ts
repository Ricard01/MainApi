import {ChangeDetectionStrategy, Component, ElementRef, inject, signal, viewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {ProductoAutocomplete} from '../../../../shared/components/producto-autocomplete';
import {Producto} from '../../../../shared/models/producto.model';
import {TipoProducto} from '../../../../shared/enums/producto.enum';
import {OverlayModule, ConnectionPositionPair} from '@angular/cdk/overlay';
import {ProductoApi} from '../../../../shared/services/producto.api';
import {UnidadMedida} from '../../../../shared/models/unidad-medida.model';

interface PrecioOption {
  id: 1 | 2 | 3;
  nombre: string;
  monto: number;
}

@Component({
  selector: 'app-cotizacion-detail',
  imports: [CommonModule, ProductoAutocomplete, ReactiveFormsModule, OverlayModule],
  templateUrl: './cotizacion-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CotizacionDetail {
  protected readonly TipoProducto = TipoProducto;
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly productoApi = inject(ProductoApi);
  private selectedProductoId: number | null = null;
  private readonly unidadTriggerRef = viewChild<ElementRef<HTMLElement>>('unidadTrigger');
  private readonly precioTriggerRef = viewChild<ElementRef<HTMLElement>>('precioTrigger');

  readonly unidades = signal<UnidadMedida[]>([]);
  readonly selectedUnidad = signal<UnidadMedida | null>(null);
  readonly isUnidadMenuOpen = signal(false);
  readonly unidadMenuWidth = signal<number | string>('100%');
  readonly precios = signal<PrecioOption[]>([]);
  readonly selectedPrecio = signal<PrecioOption | null>(null);
  readonly isPrecioMenuOpen = signal(false);
  readonly precioMenuWidth = signal<number | string>('100%');

  readonly overlayPositions = [
    new ConnectionPositionPair({originX: 'start', originY: 'bottom'}, {overlayX: 'start', overlayY: 'top'}, 0, 4),
    new ConnectionPositionPair({originX: 'start', originY: 'top'}, {overlayX: 'start', overlayY: 'bottom'}, 0, -4)
  ];

  readonly form = this.fb.group({
    codigo: '',
    producto: '',
    cantidad: 1,
    unidad: '',
    idUnidad: this.fb.control<number | null>(null),
    precio: this.fb.control<number | null>(null),
    subtotal: '',
    total: '',
  });

  onProductoSeleccionado(producto: Producto | null) {
    this.selectedProductoId = producto?.id ?? null;
    this.isUnidadMenuOpen.set(false);
    this.isPrecioMenuOpen.set(false);
    this.unidades.set([]);
    this.selectedUnidad.set(null);
    this.precios.set([]);
    this.selectedPrecio.set(null);

    this.form.controls.codigo.setValue(producto?.codigo ?? '');
    this.form.controls.producto.setValue(producto?.nombre ?? '');
    this.form.controls.unidad.setValue('');
    this.form.controls.idUnidad.setValue(null);
    this.form.controls.precio.setValue(null);

    if (!producto) return;

    const unidadBase = this.createUnidadBase(producto);
    this.selectUnidad(unidadBase);
    const precios = this.createPrecios(producto);
    this.precios.set(precios);
    this.selectPrecio(precios[0]);

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
    this.isPrecioMenuOpen.set(false);

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

  togglePrecioMenu(): void {
    if (this.precios().length === 0) return;
    this.isUnidadMenuOpen.set(false);

    const trigger = this.precioTriggerRef();
    if (trigger) {
      this.precioMenuWidth.set(trigger.nativeElement.offsetWidth);
    }

    this.isPrecioMenuOpen.update(open => !open);
  }

  selectPrecio(precio: PrecioOption): void {
    this.selectedPrecio.set(precio);
    this.form.controls.precio.setValue(precio.monto);
    this.isPrecioMenuOpen.set(false);
  }

  onPrecioManualInput(): void {
    this.selectedPrecio.set(null);
  }

  private createUnidadBase(producto: Producto): UnidadMedida {
    return {
      id: producto.idUnidad,
      nombre: producto.unidadMedida,
      abreviatura: producto.abrevUnidadMedida,
      esPrincipal: true,
    };
  }

  private createPrecios(producto: Producto): PrecioOption[] {
    return [
      {id: 1, nombre: 'Precio 1', monto: producto.precio1},
      {id: 2, nombre: 'Precio 2', monto: producto.precio2},
      {id: 3, nombre: 'Precio 3', monto: producto.precio3},
    ];
  }

}
