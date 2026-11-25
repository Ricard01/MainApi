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
  observaciones: string;
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
  agenteCodigo: string;
  agenteNombre: string;
  isPersonaMoral: boolean;
  cliente: string;
  contacto: string;
  email: string;
  telefono: string;
  observaciones: string;
  usuarioNombre: string;
  estado: CotizacionEstado;
  idCliente: number;
  clienteCodigo: string;
  clienteRazonSocial: string;
  productos: CotizacionReadMovimiento[];
}

/** 'parcial': ya se facturó una parte de las unidades; la cotización queda sólo para consulta. */
export type CotizacionEstado = 'pendiente' | 'parcial' | 'facturada';

export interface CotizacionReadMovimiento {
  idMovimiento: number;
  /** Unidades que aún no se facturan. */
  pendiente: number;
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

export interface FacturarCotizacionCommand {
  idCotizacion: number;
  /** Nulo: se factura al cliente de la cotización. */
  idCliente: number | null;
}

export interface CotizacionFacturada {
  idFactura: number;
  serie: string;
  folio: number;
}
