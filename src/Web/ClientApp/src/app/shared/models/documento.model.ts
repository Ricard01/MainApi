import {UnidadMedida} from './unidad-medida.model';
import {FormControl, FormGroup} from '@angular/forms';
import {WritableSignal} from '@angular/core';

export interface PrecioOption {
  id: 1 | 2 | 3;
  nombre: string;
  monto: number;
}

export interface DetalleControls {
  idProducto: FormControl<number>;
  codigo: FormControl<string>;
  producto: FormControl<string>;
  observaciones: FormControl<string>;
  cantidad: FormControl<number>;
  unidad: FormControl<string>;
  idUnidad: FormControl<number | null>;
  precio: FormControl<number>;
  descuentoPorcentaje: FormControl<number>;
  descuento: FormControl<number>;
  iva: FormControl<number>;
  isr: FormControl<number>;
  neto: FormControl<number>;
  total: FormControl<number>;
}

export type DetalleForm = FormGroup<DetalleControls>;

export interface DocumentoDetalleValue {
  idProducto: number;
  codigo: string;
  producto: string;
  observaciones: string;
  cantidad: number;
  unidad: string;
  idUnidad: number | null;
  precio: number;
  descuentoPorcentaje: number;
  descuento: number;
  iva: number;
  isr: number;
  neto: number;
  total: number;
}

export interface DetalleState {
  id: string;
  selectedProductoId: number | null;
  unidades: WritableSignal<UnidadMedida[]>;
  selectedUnidad: WritableSignal<UnidadMedida | null>;
  isUnidadMenuOpen: WritableSignal<boolean>;
  unidadMenuWidth: WritableSignal<number | string>;
  precios: WritableSignal<PrecioOption[]>;
  selectedPrecio: WritableSignal<PrecioOption | null>;
  isPrecioMenuOpen: WritableSignal<boolean>;
  precioMenuWidth: WritableSignal<number | string>;
  cantidadDisplay: WritableSignal<string>;
  precioDisplay: WritableSignal<string>;
  descuentoPorcentajeDisplay: WritableSignal<string>;
  descuentoDisplay: WritableSignal<string>;
}

export interface TotalesDetalle {
  productos: number;
  subtotal: number;
  descuento: number;
  iva: number;
  isr: number;
  total: number;
}
