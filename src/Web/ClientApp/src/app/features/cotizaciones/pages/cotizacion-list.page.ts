import {ChangeDetectionStrategy, Component} from '@angular/core';
import {CotizacionList} from '../components/cotizacion-list/cotizacion-list';

@Component({
  selector: 'app-cotizacion-list-page',
  imports:[CotizacionList],
  template:`
  <app-cotizacion-list></app-cotizacion-list>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class CotizacionListPage {

}
