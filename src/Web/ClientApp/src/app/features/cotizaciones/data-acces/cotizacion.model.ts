export interface CreateCotizacionCommand {
  id: number;
  fecha: string;
  serie: string;
  folio: number;
  idAgente: number;
  isPersonaMoral: boolean;
  cliente: string;
  contacto: string;
  email: string;
  telefono: string;
  observaciones: string;
  productos: Productos[],
  totalProductos: number;
  total: number;
}

export interface Productos {
  idProducto: number;
  idUnidadMedida: number;
  cantidad: number;
  precio: number;
  observaciones:string;
  descuentoPorcentaje: number;
  descuento: number;
  neto: number;
  iva: number;
  isr: number;
  total: number;
}

export interface CotizacionHeaderValue {
  isPersonaMoral: boolean;
  idAgente: number;
  agente: string;
  cliente: string;
  fecha: string;
  serie: string;
  folio: string;
  contacto: string;
  email: string;
  telefono: string;
  observaciones: string;
}

export interface CotizacionReadModel {
  id: number;
  fecha: string;
  serie: string;
  folio: number;
  idAgente: number;
  isPersonaMoral: boolean;
  cliente: string;
  contacto: string;
  email: string;
  telefono: string;
  observaciones: string;
  usuarioNombre: string;
  productos: CotizacionReadMovimiento[];
}

export interface CotizacionReadMovimiento {
  idProducto: number;
  codigo: string;
  producto: string;
  observaciones: string;
  cantidad: number;
  idUnidad: number;
  unidad: string;
  precio: number;
  descuentoPorcentaje: number;
  descuento: number;
  neto: number;
  iva: number;
  isr: number;
  total: number;
}
