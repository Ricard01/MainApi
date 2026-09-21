
import {DocumentoDetalleValue, TotalesDetalle} from '../../../../shared/models/documento.model';
import {FacturaHeaderValue} from '../../data-acces/factura.model';

export interface FacturaPreviewData {
  header: FacturaHeaderValue;
  detalles: DocumentoDetalleValue[];
  resumen: TotalesDetalle;
  usuarioNombre: string;
  usuarioEmail: string;
  usuarioTelefono: string;
  descargarAlAbrir?: boolean;
}
