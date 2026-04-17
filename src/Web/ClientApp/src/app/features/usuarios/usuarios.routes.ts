export const usuariosRoutes = [
    {
      path: '',
      children: [
        {
          path: '',
          loadComponent: () => import('./pages/user-list.page').then(m => m.UserListPage),
        },
        {
          path: 'nuevo',
          loadComponent: () => import('./pages/user.page').then(m => m.UserPage)
        },
        {
          path: ':id',
          loadComponent: () => import('./pages/user.page').then(m => m.UserPage)

        }

      ]
    }
  ]
;
