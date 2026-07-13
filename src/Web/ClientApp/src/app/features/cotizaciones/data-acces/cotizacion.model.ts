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
  productos: Productos[],
  totalProductos: number;
  total: number;
}

export interface Productos {
  idProducto: number;
  idUnidadMedida: number;
  cantidad: number;
  precio: number;
  observacion:string;
  descuentoPorcentaje: number;
  descuento: number;
  neto: number;
  iva: number;
  isr: number;
  total: number;
}
