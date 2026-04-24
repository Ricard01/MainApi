export const rolesRoutes = [
  {
    path: '',
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/rol-list.page').then(m => m.RolListPage),
      },

    ]
  }
]
