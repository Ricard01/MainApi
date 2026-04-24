export const rolesRoutes = [
  {
    path: '',
    children: [
      {path: '', loadComponent: () => import('./pages/rol-list.page').then(m => m.RolListPage)},
      {path: 'nuevo', loadComponent: () => import('./components/rol-upsert/rol-upsert').then(m => m.RolUpsert)}
    ]
  }
]
