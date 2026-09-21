import {Routes} from '@angular/router';

export const facturasRoutes: Routes = [
  {
    path: '',
    children: [
      {path: '', pathMatch: 'full', loadComponent: () => import('./pages/factura-list.page').then(m => m.FacturaListPage)},
      {path: 'nuevo', loadComponent: () => import('./pages/factura-page').then(m => m.FacturaPage)},
      {path: ':id', loadComponent: () => import('./pages/factura-page').then(m => m.FacturaPage)},
    ]
  }
]
