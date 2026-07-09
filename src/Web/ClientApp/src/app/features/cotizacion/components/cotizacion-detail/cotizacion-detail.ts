import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {DocumentoDetail} from '../../../../shared/components/documento-detail/documento-detail';

@Component({
  selector: 'app-cotizacion-detail',
  imports: [DocumentoDetail],
  templateUrl: './cotizacion-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CotizacionDetail {
  readonly isPersonaMoral = input(true);
}
