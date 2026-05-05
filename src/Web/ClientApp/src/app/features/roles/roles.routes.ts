export const rolesRoutes = [
  {
    path: '',
    children: [
      {path: '', loadComponent: () => import('./pages/rol-list.page').then(m => m.RolListPage)},
      {path: 'nuevo', loadComponent: () => import('./pages/rol-page').then(m => m.RolPage)},
      {path:':id', loadComponent: () => import('./pages/rol-page').then(m => m.RolPage)},
      ]
  }
]
