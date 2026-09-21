export interface CreateFacturaCommand {
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

export interface FacturaHeaderValue {
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

export interface FacturaReadModel {
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
  estado: 'pendiente' | 'facturada';
  productos: FacturaReadMovimiento[];
}

export interface FacturaReadMovimiento {
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
