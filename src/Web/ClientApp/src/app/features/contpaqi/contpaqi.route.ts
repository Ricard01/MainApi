export const contpaqRoutes = [
    {
      path: '',
      children: [
        {
          path: '',
          loadComponent: () => import('./components/contpaqi-upsert').then(m => m.ContpaqiUpsert),
        },

      ]
    }
  ]
;
