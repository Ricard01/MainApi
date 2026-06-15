export type MenuItem = {
  icon: string;
  label: string;
  route?: string;
  subItems?: MenuItem[];
};

export const items: MenuItem[] = [
  {
    icon: 'home',
    label: 'Home',
    route: 'home',
  },
  {
    icon: 'article',
    label: 'cotización',
    route: 'cotizacion',
  },
  {
    icon: 'user',
    label: 'Usuarios',
    route: 'usuarios',
  },
  {
    icon: 'rol',
    label: 'Permisos',
    route: 'roles',
  },
    {
    icon: 'sync_desktop',
    label: 'Contpaqi',
    route: 'contpaqi',
  },
];
