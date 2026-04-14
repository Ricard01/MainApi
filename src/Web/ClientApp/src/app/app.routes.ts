import {Routes} from '@angular/router';
import {HomeComponent} from './features/home/home.component';
import {Empleado} from './features/empleado/empleado';
import {LoginPage} from './core/auth/pages/login.page';
import {authGuard} from './core/guards/auth-guard';

export const routes: Routes = [
  {path: 'login', component: LoginPage},
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./core/layout/layout').then(m => m.Layout),
    children: [
      {path: '', pathMatch: 'full', redirectTo: 'dashboard'},
      {path: 'home', component: HomeComponent},
      {path: 'empleados', component: Empleado},
    ]
  },
  {path: '**', redirectTo: 'dashboard'}
];
