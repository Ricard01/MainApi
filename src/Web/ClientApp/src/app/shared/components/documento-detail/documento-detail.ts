import {ChangeDetectionStrategy, Component, WritableSignal, effect, inject, input, output, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormArray, FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {ConnectionPositionPair, OverlayModule} from '@angular/cdk/overlay';
import {MatIconModule} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';
import {catchError, of} from 'rxjs';
import {ProductoAutocomplete} from '../producto-autocomplete/producto-autocomplete';
import {Producto} from '../../models/producto.model';
import {TipoProducto} from '../../enums/producto.enum';
import {ProductoApi} from '../../services/producto.api';
import {UnidadMedida} from '../../models/unidad-medida.model';
import {
  DetalleControls,
  DetalleForm,
  DetalleState,
  DocumentoDetalleValue,
  PrecioOption,
  TotalesDetalle
} from '../../models/documento.model';

@Component({
  selector: 'documento-detail',
  imports: [CommonModule, ProductoAutocomplete, ReactiveFormsModule, OverlayModule, MatIconModule, MatIconButton],
  templateUrl: './documento-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class DocumentoDetail {
  protected readonly TipoProducto = TipoProducto;
  readonly isPersonaMoral = input(true);
  readonly guardar = output<void>();
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly productoApi = inject(ProductoApi);
  private rowId = 0;

  readonly detalleStates = signal<DetalleState[]>([]);
  readonly resumen = signal<TotalesDetalle>({
    productos: 0,
    subtotal: 0,
    descuento: 0,
    iva: 0,
    isr: 0,
    total: 0,
  });

  readonly overlayPositions = [
    new ConnectionPositionPair({originX: 'start', originY: 'bottom'}, {overlayX: 'start', overlayY: 'top'}, 0, 4),
    new ConnectionPositionPair({originX: 'start', originY: 'top'}, {overlayX: 'start', overlayY: 'bottom'}, 0, -4)
  ];

  readonly form = this.fb.group({
    detalles: this.fb.array<DetalleForm>([]),
  });

  private readonly personaMoralEffect = effect(() => {
    this.isPersonaMoral();
    this.detalleForms().forEach((_, index) => this.recalculateAmounts(index));
  });

  constructor() {
    this.addProducto();
  }

  get detalles(): FormArray<DetalleForm> {
    return this.form.controls.detalles;
  }

  detalleForms(): DetalleForm[] {
    return this.detalles.controls;
  }

  isValid(): boolean {
    return this.form.valid && this.getDetallesValue().length > 0;
  }

  markAsTouched(): void {
    this.form.markAllAsTouched();
  }

  getDetallesValue(): DocumentoDetalleValue[] {
    return this.detalleForms()
      .map(row => row.getRawValue())
      .filter(detalle => detalle.idProducto > 0);
  }

  getResumenValue(): TotalesDetalle {
    return this.resumen();
  }

  addProducto(): void {
    this.detalles.push(this.createDetalleForm());
    this.detalleStates.update(states => [...states, this.createDetalleState()]);
    this.updateResumen();
  }

  removeProducto(index: number): void {
    if (this.detalles.length <= 1) return;

    this.detalles.removeAt(index);
    this.detalleStates.update(states => states.filter((_, stateIndex) => stateIndex !== index));
    this.updateResumen();
  }

  onProductoSeleccionado(producto: Producto | null, index: number): void {
    const row = this.rowAt(index);
    const state = this.stateAt(index);

    state.selectedProductoId = producto?.id ?? null;
    state.isUnidadMenuOpen.set(false);
    state.isPrecioMenuOpen.set(false);
    state.unidades.set([]);
    state.selectedUnidad.set(null);
    state.precios.set([]);
    state.selectedPrecio.set(null);

    row.controls.idProducto.setValue(producto?.id ?? 0);
    row.controls.codigo.setValue(producto?.codigo ?? '');
    row.controls.producto.setValue(producto?.nombre ?? '');
    this.resetProductDependentValues(index);
    this.recalculateAmounts(index);

    if (!producto) return;

    const unidadBase = this.createUnidadBase(producto);
    this.selectUnidad(unidadBase, index);
    const precios = this.createPrecios(producto);
    state.precios.set(precios);
    this.selectPrecio(precios[0], index);

    this.productoApi.getUnidadesMedida(producto.id).pipe(
      catchError(() => of([unidadBase]))
    ).subscribe(unidades => {
      const currentIndex = this.detalleStates().indexOf(state);
      if (currentIndex < 0 || state.selectedProductoId !== producto.id) return;

      const disponibles = unidades.length > 0 ? unidades : [unidadBase];
      const principal = disponibles.find(unidad => unidad.esPrincipal)
        ?? disponibles.find(unidad => unidad.id === producto.idUnidad)
        ?? disponibles[0];

      state.unidades.set(disponibles);
      this.selectUnidad(principal, currentIndex);
    });
  }

  toggleUnidadMenu(index: number, trigger: HTMLElement): void {
    const state = this.stateAt(index);
    if (state.unidades().length === 0) return;

    state.isPrecioMenuOpen.set(false);
    state.unidadMenuWidth.set(trigger.offsetWidth);
    state.isUnidadMenuOpen.update(open => !open);
  }

  selectUnidad(unidad: UnidadMedida, index: number): void {
    const row = this.rowAt(index);
    const state = this.stateAt(index);

    state.selectedUnidad.set(unidad);
    row.controls.idUnidad.setValue(unidad.id);
    row.controls.unidad.setValue(unidad.abreviatura || unidad.nombre);
    state.isUnidadMenuOpen.set(false);
  }

  togglePrecioMenu(index: number, trigger: HTMLElement): void {
    const state = this.stateAt(index);
    if (state.precios().length === 0) return;

    state.isUnidadMenuOpen.set(false);
    state.precioMenuWidth.set(trigger.offsetWidth);
    state.isPrecioMenuOpen.update(open => !open);
  }

  selectPrecio(precio: PrecioOption, index: number): void {
    const row = this.rowAt(index);
    const state = this.stateAt(index);

    state.selectedPrecio.set(precio);
    row.controls.precio.setValue(this.roundCurrency(precio.monto));
    state.precioDisplay.set(this.formatDecimal(row.controls.precio.value));
    state.isPrecioMenuOpen.set(false);
    this.updateDescuentoImporteIfPercentageMode(index);
    this.recalculateAmounts(index);
  }

  onCantidadInput(event: Event, index: number): void {
    this.normalizeDecimalInput(event, this.rowAt(index).controls.cantidad, this.stateAt(index).cantidadDisplay);
    this.updateDescuentoImporteIfPercentageMode(index);
    this.recalculateAmounts(index);
  }

  onCantidadBlur(event: Event, index: number): void {
    this.formatControlDecimal(this.rowAt(index).controls.cantidad);
    this.formatInputDecimal(event, this.rowAt(index).controls.cantidad.value, this.stateAt(index).cantidadDisplay);
    this.updateDescuentoImporteIfPercentageMode(index);
    this.recalculateAmounts(index);
  }

  onPrecioManualInput(event: Event, index: number): void {
    this.stateAt(index).selectedPrecio.set(null);
    this.normalizeDecimalInput(event, this.rowAt(index).controls.precio, this.stateAt(index).precioDisplay);
    this.updateDescuentoImporteIfPercentageMode(index);
    this.recalculateAmounts(index);
  }

  onPrecioBlur(event: Event, index: number): void {
    this.formatControlDecimal(this.rowAt(index).controls.precio);
    this.formatInputDecimal(event, this.rowAt(index).controls.precio.value, this.stateAt(index).precioDisplay);
    this.updateDescuentoImporteIfPercentageMode(index);
    this.recalculateAmounts(index);
  }

  onDescuentoPorcentajeInput(event: Event, index: number): void {
    this.normalizeDecimalInput(event, this.rowAt(index).controls.descuentoPorcentaje, this.stateAt(index).descuentoPorcentajeDisplay);
    this.updateDescuentoImporteFromPorcentaje(index);
    this.recalculateAmounts(index);
  }

  onDescuentoPorcentajeBlur(event: Event, index: number): void {
    this.formatControlDecimal(this.rowAt(index).controls.descuentoPorcentaje);
    this.formatInputDecimal(event, this.rowAt(index).controls.descuentoPorcentaje.value, this.stateAt(index).descuentoPorcentajeDisplay);
    this.updateDescuentoImporteFromPorcentaje(index);
    this.recalculateAmounts(index);
  }

  onDescuentoImporteInput(event: Event, index: number): void {
    this.stateAt(index).descuentoPorcentajeDisplay.set('0.00');
    this.rowAt(index).controls.descuentoPorcentaje.setValue(0, {emitEvent: false});
    this.normalizeDecimalInput(event, this.rowAt(index).controls.descuento, this.stateAt(index).descuentoDisplay);
    this.recalculateAmounts(index);
  }

  onDescuentoImporteBlur(event: Event, index: number): void {
    const descuento = this.rowAt(index).controls.descuento;

    this.formatControlDecimal(descuento);
    this.formatInputDecimal(event, descuento.value, this.stateAt(index).descuentoDisplay);
    this.recalculateAmounts(index);
  }

  private createDetalleForm(): DetalleForm {
    return new FormGroup<DetalleControls>({
      idProducto: this.fb.control(0),
      codigo: this.fb.control(''),
      producto: this.fb.control(''),
      observaciones: this.fb.control(''),
      cantidad: this.fb.control(1.00),
      unidad: this.fb.control(''),
      idUnidad: this.fb.control<number | null>(null),
      precio: this.fb.control(0),
      descuentoPorcentaje: this.fb.control(0),
      descuento: this.fb.control(0),
      iva: this.fb.control(0),
      isr: this.fb.control(0),
      neto: this.fb.control(0),
      total: this.fb.control(0),
    });
  }

  private createDetalleState(): DetalleState {
    return {
      id: `detalle-${++this.rowId}`,
      selectedProductoId: null,
      unidades: signal<UnidadMedida[]>([]),
      selectedUnidad: signal<UnidadMedida | null>(null),
      isUnidadMenuOpen: signal(false),
      unidadMenuWidth: signal<number | string>('100%'),
      precios: signal<PrecioOption[]>([]),
      selectedPrecio: signal<PrecioOption | null>(null),
      isPrecioMenuOpen: signal(false),
      precioMenuWidth: signal<number | string>('100%'),
      cantidadDisplay: signal('1.00'),
      precioDisplay: signal('0.00'),
      descuentoPorcentajeDisplay: signal('0.00'),
      descuentoDisplay: signal('0.00'),
    };
  }

  private rowAt(index: number): DetalleForm {
    return this.detalles.at(index);
  }

  private stateAt(index: number): DetalleState {
    return this.detalleStates()[index];
  }

  private createUnidadBase(producto: Producto): UnidadMedida {
    return {
      id: producto.idUnidad,
      nombre: producto.unidadMedida,
      abreviatura: producto.abrevUnidadMedida,
      esPrincipal: true,
    };
  }

  private resetProductDependentValues(index: number): void {
    const row = this.rowAt(index);
    const state = this.stateAt(index);

    row.patchValue({
      observaciones: '',
      cantidad: 1,
      unidad: '',
      idUnidad: null,
      precio: 0,
      descuentoPorcentaje: 0,
      descuento: 0,
      iva: 0,
      isr: 0,
      neto: 0,
      total: 0,
    }, {emitEvent: false});
    this.resetDecimalDisplays(state);
  }

  private resetDecimalDisplays(state: DetalleState): void {
    state.cantidadDisplay.set('1.00');
    state.precioDisplay.set('0.00');
    state.descuentoPorcentajeDisplay.set('0.00');
    state.descuentoDisplay.set('0.00');
  }

  private createPrecios(producto: Producto): PrecioOption[] {
    return [
      {id: 1, nombre: 'Precio 1', monto: producto.precio1},
      {id: 2, nombre: 'Precio 2', monto: producto.precio2},
      {id: 3, nombre: 'Precio 3', monto: producto.precio3},
    ];
  }

  private normalizeDecimalInput(event: Event, control: FormControl<number>, display: WritableSignal<string>): void {
    const input = event.target as HTMLInputElement;
    const normalized = this.limitDecimalText(input.value);

    if (input.value !== normalized) {
      input.value = normalized;
    }

    display.set(normalized);
    control.setValue(this.parseDecimal(normalized), {emitEvent: false});
  }

  private formatControlDecimal(control: FormControl<number>): void {
    control.setValue(this.roundCurrency(control.value), {emitEvent: false});
  }

  private formatInputDecimal(event: Event, value: number, display: WritableSignal<string>): void {
    const input = event.target as HTMLInputElement;
    const formatted = this.formatDecimal(value);

    display.set(formatted);
    input.value = formatted;
  }

  private limitDecimalText(value: string): string {
    const cleaned = value.replace(/,/g, '.').replace(/[^\d.]/g, '');
    if (cleaned === '') return '';

    const [integerPart, ...decimalParts] = cleaned.split('.');
    const integer = integerPart || '0';
    const decimal = decimalParts.join('').slice(0, 2);

    return cleaned.includes('.') ? `${integer}.${decimal}` : integer;
  }

  protected formatDecimal(value: string | number): string {
    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed.toFixed(2) : '0.00';
  }

  private recalculateAmounts(index: number): void {
    const row = this.rowAt(index);
    const cantidad = row.controls.cantidad.value;
    const precio = row.controls.precio.value;
    const importeBruto = cantidad * precio;
    const descuento = row.controls.descuento.value;
    const baseImpuesto = Math.max(importeBruto - descuento, 0);
    const iva = this.roundCurrency(baseImpuesto * 0.16);
    const isr = this.isPersonaMoral() ? this.roundCurrency(baseImpuesto * 0.0125) : 0;
    const total = this.roundCurrency(baseImpuesto - isr + iva);

    row.patchValue({
      neto: this.roundCurrency(importeBruto),
      iva,
      isr,
      total,
    }, {emitEvent: false});

    this.updateResumen();
  }

  private updateDescuentoImporteFromPorcentaje(index: number): void {
    const row = this.rowAt(index);
    const state = this.stateAt(index);
    const cantidad = row.controls.cantidad.value;
    const precio = row.controls.precio.value;
    const porcentaje = row.controls.descuentoPorcentaje.value;
    const importeBruto = cantidad * precio;
    const descuentoImporte = this.roundCurrency(importeBruto * (porcentaje / 100));

    row.controls.descuento.setValue(descuentoImporte, {emitEvent: false});
    state.descuentoDisplay.set(this.formatDecimal(descuentoImporte));
  }

  private updateDescuentoImporteIfPercentageMode(index: number): void {
    const porcentaje = this.rowAt(index).controls.descuentoPorcentaje.value;
    if (porcentaje <= 0) return;

    this.updateDescuentoImporteFromPorcentaje(index);
  }

  private updateResumen(): void {
    const resumen = this.detalleForms().reduce<TotalesDetalle>((acc, row) => ({
      productos: acc.productos + (row.controls.idProducto.value > 0 ? row.controls.cantidad.value : 0),
      subtotal: acc.subtotal + row.controls.neto.value,
      descuento: acc.descuento + row.controls.descuento.value,
      iva: acc.iva + row.controls.iva.value,
      isr: acc.isr + row.controls.isr.value,
      total: acc.total + row.controls.total.value,
    }), {
      productos: 0,
      subtotal: 0,
      descuento: 0,
      iva: 0,
      isr: 0,
      total: 0,
    });

    this.resumen.set({
      productos: this.roundCurrency(resumen.productos),
      subtotal: this.roundCurrency(resumen.subtotal),
      descuento: this.roundCurrency(resumen.descuento),
      iva: this.roundCurrency(resumen.iva),
      isr: this.roundCurrency(resumen.isr),
      total: this.roundCurrency(resumen.total),
    });
  }

  private parseDecimal(value: string | number): number {
    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : 0;
  }

  private roundCurrency(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }
}
