import {ChangeDetectionStrategy, Component, ElementRef, effect, inject, input, signal, viewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormControl, NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {ProductoAutocomplete} from '../../../../shared/components/producto-autocomplete/producto-autocomplete';
import {Producto} from '../../../../shared/models/producto.model';
import {TipoProducto} from '../../../../shared/enums/producto.enum';
import {OverlayModule, ConnectionPositionPair} from '@angular/cdk/overlay';
import {ProductoApi} from '../../../../shared/services/producto.api';
import {UnidadMedida} from '../../../../shared/models/unidad-medida.model';
import {MatIconModule} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';

interface PrecioOption {
  id: 1 | 2 | 3;
  nombre: string;
  monto: number;
}

type DescuentoModo = 'porcentaje' | 'importe';

@Component({
  selector: 'app-cotizacion-detail',
  imports: [CommonModule, ProductoAutocomplete, ReactiveFormsModule, OverlayModule, MatIconModule, MatIconButton],
  templateUrl: './cotizacion-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CotizacionDetail {
  protected readonly TipoProducto = TipoProducto;
  readonly isPersonaMoral = input(true);
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
  readonly descuentoModo = signal<DescuentoModo>('porcentaje');
  readonly descuentoPorcentajeInput = this.fb.control('0.00');

  readonly overlayPositions = [
    new ConnectionPositionPair({originX: 'start', originY: 'bottom'}, {overlayX: 'start', overlayY: 'top'}, 0, 4),
    new ConnectionPositionPair({originX: 'start', originY: 'top'}, {overlayX: 'start', overlayY: 'bottom'}, 0, -4)
  ];

  readonly form = this.fb.group({
    idProducto:0,
    codigo: '',
    producto: '',
    observaciones: '',
    cantidad: '1.00',
    unidad: '',
    idUnidad: this.fb.control<number | null>(null),
    precio: '',
    descuento: '0.00',
    iva: '',
    isr: '',
    subtotal: '',
    total: '',
  });

  private readonly personaMoralEffect = effect(() => {
    this.isPersonaMoral();
    this.recalculateAmounts();
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
    this.resetProductDependentValues();
    this.recalculateAmounts();

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
    this.form.controls.precio.setValue(this.formatDecimal(precio.monto, 4));
    this.isPrecioMenuOpen.set(false);
    this.updateDescuentoImporteIfPercentageMode();
    this.recalculateAmounts();
  }

  onCantidadInput(event: Event): void {
    this.normalizeDecimalInput(event, 'cantidad', 2);
    this.updateDescuentoImporteIfPercentageMode();
    this.recalculateAmounts();
  }

  onCantidadBlur(): void {
    this.formatControlDecimal('cantidad', 2);
    this.updateDescuentoImporteIfPercentageMode();
    this.recalculateAmounts();
  }

  onPrecioManualInput(event: Event): void {
    this.selectedPrecio.set(null);
    this.normalizeDecimalInput(event, 'precio', 4);
    this.updateDescuentoImporteIfPercentageMode();
    this.recalculateAmounts();
  }

  onPrecioBlur(): void {
    this.formatControlDecimal('precio', 4);
    this.updateDescuentoImporteIfPercentageMode();
    this.recalculateAmounts();
  }

  onDescuentoPorcentajeInput(event: Event): void {
    this.descuentoModo.set('porcentaje');
    this.normalizeStandaloneDecimalInput(event, this.descuentoPorcentajeInput, 2);
    this.updateDescuentoImporteFromPorcentaje();
    this.recalculateAmounts();
  }

  onDescuentoPorcentajeBlur(): void {
    if (this.descuentoPorcentajeInput.value === '') {
      this.descuentoPorcentajeInput.setValue('0.00', {emitEvent: false});
    }

    this.formatStandaloneDecimal(this.descuentoPorcentajeInput, 2);
    this.updateDescuentoImporteFromPorcentaje();
    this.recalculateAmounts();
  }

  onDescuentoImporteInput(event: Event): void {
    this.descuentoModo.set('importe');
    this.descuentoPorcentajeInput.setValue('0.00', {emitEvent: false});
    this.normalizeDecimalInput(event, 'descuento', 2);
    this.recalculateAmounts();
  }

  onDescuentoImporteBlur(): void {
    if (this.form.controls.descuento.value === '') {
      this.form.controls.descuento.setValue('0.00', {emitEvent: false});
    }

    this.formatControlDecimal('descuento', 2);
    this.recalculateAmounts();
  }

  private createUnidadBase(producto: Producto): UnidadMedida {
    return {
      id: producto.idUnidad,
      nombre: producto.unidadMedida,
      abreviatura: producto.abrevUnidadMedida,
      esPrincipal: true,
    };
  }

  private resetProductDependentValues(): void {
    this.descuentoModo.set('porcentaje');
    this.descuentoPorcentajeInput.setValue('0.00', {emitEvent: false});

    this.form.patchValue({
      observaciones: '',
      cantidad: '1.00',
      unidad: '',
      idUnidad: null,
      precio: '',
      descuento: '0.00',
      iva: '',
      isr: '',
      subtotal: '',
      total: '',
    }, {emitEvent: false});
  }

  private createPrecios(producto: Producto): PrecioOption[] {
    return [
      {id: 1, nombre: 'Precio 1', monto: producto.precio1},
      {id: 2, nombre: 'Precio 2', monto: producto.precio2},
      {id: 3, nombre: 'Precio 3', monto: producto.precio3},
    ];
  }

  private normalizeDecimalInput(event: Event, controlName: 'cantidad' | 'precio' | 'descuento', decimals: number): void {
    const input = event.target as HTMLInputElement;
    const normalized = this.limitDecimalText(input.value, decimals);

    if (input.value !== normalized) {
      input.value = normalized;
    }

    this.form.controls[controlName].setValue(normalized, {emitEvent: false});
  }

  private normalizeStandaloneDecimalInput(
    event: Event,
    control: FormControl<string>,
    decimals: number
  ): void {
    const input = event.target as HTMLInputElement;
    const normalized = this.limitDecimalText(input.value, decimals);

    if (input.value !== normalized) {
      input.value = normalized;
    }

    control.setValue(normalized, {emitEvent: false});
  }

  private formatControlDecimal(controlName: 'cantidad' | 'precio' | 'descuento', decimals: number): void {
    const control = this.form.controls[controlName];
    const value = control.value;

    if (value === '') return;

    control.setValue(this.formatDecimal(value, decimals), {emitEvent: false});
  }

  private formatStandaloneDecimal(control: FormControl<string>, decimals: number): void {
    const value = control.value;

    if (value === '') return;

    control.setValue(this.formatDecimal(value, decimals), {emitEvent: false});
  }

  private limitDecimalText(value: string, decimals: number): string {
    const cleaned = value.replace(/,/g, '.').replace(/[^\d.]/g, '');
    if (cleaned === '') return '';

    const [integerPart, ...decimalParts] = cleaned.split('.');
    const integer = integerPart || '0';
    const decimal = decimalParts.join('').slice(0, decimals);

    return cleaned.includes('.') ? `${integer}.${decimal}` : integer;
  }

  private formatDecimal(value: string | number, decimals: number): string {
    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed.toFixed(decimals) : '';
  }

  private recalculateAmounts(): void {
    const cantidad = this.parseDecimal(this.form.controls.cantidad.value);
    const precio = this.parseDecimal(this.form.controls.precio.value);
    const importeBruto = cantidad * precio;
    const descuento = this.parseDecimal(this.form.controls.descuento.value);
    const baseImpuesto = importeBruto - descuento;
    const iva = this.roundCurrency(baseImpuesto * 0.16);
    const isr = this.isPersonaMoral() ? this.roundCurrency(baseImpuesto * 0.0125) : 0;
    const total = this.roundCurrency(baseImpuesto - isr + iva);

    this.form.patchValue({
      subtotal: this.formatDecimal(importeBruto, 2),
      iva: this.formatDecimal(iva, 2),
      isr: this.formatDecimal(isr, 2),
      total: this.formatDecimal(total, 2),
    }, {emitEvent: false});
  }

  private updateDescuentoImporteFromPorcentaje(): void {
    const cantidad = this.parseDecimal(this.form.controls.cantidad.value);
    const precio = this.parseDecimal(this.form.controls.precio.value);
    const porcentaje = this.parseDecimal(this.descuentoPorcentajeInput.value);
    const importeBruto = cantidad * precio;
    const descuentoImporte = this.roundCurrency(importeBruto * (porcentaje / 100));

    this.form.controls.descuento.setValue(this.formatDecimal(descuentoImporte, 2), {emitEvent: false});
  }

  private updateDescuentoImporteIfPercentageMode(): void {
    if (this.descuentoModo() !== 'porcentaje') return;

    this.updateDescuentoImporteFromPorcentaje();
  }

  private parseDecimal(value: string): number {
    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : 0;
  }

  private roundCurrency(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

}
