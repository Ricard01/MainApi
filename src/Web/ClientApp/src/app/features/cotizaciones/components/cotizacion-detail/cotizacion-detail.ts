import {ChangeDetectionStrategy, Component, input, output, viewChild} from '@angular/core';
import { DocumentoDetail } from '../../../../shared/components/documento-detail/documento-detail';
import {DocumentoDetalleValue, TotalesDetalle} from '../../../../shared/models/documento.model';

@Component({
  selector: 'app-cotizacion-detail',
  imports: [DocumentoDetail],
  templateUrl: './cotizacion-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CotizacionDetail {
  readonly isPersonaMoral = input(true);
  readonly actionsDisabled = input(false);
  readonly guardar = output<void>();
  private readonly documentoDetail = viewChild.required(DocumentoDetail);

  isValid(): boolean {
    return this.documentoDetail().isValid();
  }

  markAsTouched(): void {
    this.documentoDetail().markAsTouched();
  }

  getDetallesValue(): DocumentoDetalleValue[] {
    return this.documentoDetail().getDetallesValue();
  }

  getResumenValue(): TotalesDetalle {
    return this.documentoDetail().getResumenValue();
  }
}
