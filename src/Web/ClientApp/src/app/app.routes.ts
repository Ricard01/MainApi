import {Routes} from '@angular/router';
import {HomeComponent} from './features/home/home.component';
import {LoginPage} from './core/auth/pages/login.page';
import {authGuard} from './core/guards/auth-guard';
import {guestGuard} from './core/guards/guest-guard';

export const routes: Routes = [
  {path: 'login', canActivate: [guestGuard], component: LoginPage},
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./core/layout/layout').then(m => m.Layout),
    children: [
      {path: '', pathMatch: 'full', redirectTo: 'home'},
      {path: 'home', component: HomeComponent},
      {path: 'cotizacion', loadChildren: () => import('./features/cotizacion/cotizacion.routes').then(m => m.cotizacionRoutes)},
      {path: 'usuarios', loadChildren: () => import('./features/usuarios/usuarios.routes').then(m => m.usuariosRoutes)},
      {path: 'roles', loadChildren: () => import('./features/roles/roles.routes').then(m => m.rolesRoutes)},
      {path: 'contpaqi', loadChildren: () => import('./features/contpaqi/contpaqi.route').then(m => m.contpaqRoutes)},
    ]
  },
  {path: '**', redirectTo: 'home'}
];
