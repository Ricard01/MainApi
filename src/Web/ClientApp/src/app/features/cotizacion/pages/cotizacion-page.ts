import {ChangeDetectionStrategy, Component} from '@angular/core';
import {CotizacionHeader} from '../components/cotizacion-header/cotizacion-header';


@Component({
  selector: 'app-cotizacion-page',
  imports: [CotizacionHeader],
  template: `


    <h2>Cotización PAGE</h2>
    <app-cotizacion-header></app-cotizacion-header>

  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CotizacionPage {


}
