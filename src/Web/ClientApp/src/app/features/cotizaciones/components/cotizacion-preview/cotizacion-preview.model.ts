import {CotizacionHeaderValue} from '../../data-acces/cotizacion.model';
import {DocumentoDetalleValue, TotalesDetalle} from '../../../../shared/models/documento.model';

export interface CotizacionPreviewData {
  header: CotizacionHeaderValue;
  detalles: DocumentoDetalleValue[];
  resumen: TotalesDetalle;
}
