export const cotizacionesRoutes = [
  {
    path: '',
    children: [
      {path: '', loadComponent: () => import('./pages/cotizacion-page').then(m => m.CotizacionPage)},
    ]
  }
]
