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
      {path: 'usuarios', loadChildren: () => import('./features/usuarios/usuarios.routes').then(m => m.usuariosRoutes)},
    ]
  },
  {path: '**', redirectTo: 'home'}
];
