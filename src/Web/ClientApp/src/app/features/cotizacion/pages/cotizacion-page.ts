import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {CotizacionHeader} from '../components/cotizacion-header/cotizacion-header';
import {CotizacionDetail} from '../components/cotizacion-detail/cotizacion-detail';


@Component({
  selector: 'app-cotizacion-page',
  imports: [CotizacionHeader, CotizacionDetail],
  template: `


    <h2>Cotización PAGE</h2>
    <app-cotizacion-header (personaMoralChange)="isPersonaMoral.set($event)"></app-cotizacion-header>
    <app-cotizacion-detail [isPersonaMoral]="isPersonaMoral()"></app-cotizacion-detail>

  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CotizacionPage {

  readonly isPersonaMoral = signal(true);

}
