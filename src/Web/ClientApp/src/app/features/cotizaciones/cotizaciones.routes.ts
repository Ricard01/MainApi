import {Routes} from '@angular/router';

export const cotizacionesRoutes: Routes = [
  {
    path: '',
    children: [
      {path: '', pathMatch: 'full', loadComponent: () => import('./pages/cotizacion-list.page').then(m => m.CotizacionListPage)},
      {path: 'nuevo', loadComponent: () => import('./pages/cotizacion-page').then(m => m.CotizacionPage)},
    ]
  }
]
