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
    icon: 'user',
    label: 'Usuarios',
    route: 'usuarios',
  },
  {
    icon: 'rol',
    label: 'Permisos',
    route: 'mi-vehiculo',
  },
];
