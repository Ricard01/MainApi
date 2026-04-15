export const usuariosRoutes = [
  {
    path: '',
    children: [
      {
        path: '',
        loadComponent: () => import('./components/user-list/user-list').then(m => m.UserList),
      },
      ]
  }
];
