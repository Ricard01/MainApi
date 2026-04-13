import {Routes} from '@angular/router';
import {HomeComponent} from './features/home/home.component';
import {Empleado} from './features/empleado/empleado';

export const routes: Routes = [

  {
    path: '',

    loadComponent: () => import('./layout/layout').then(m => m.Layout),
    children: [
      {path: '', pathMatch: 'full', redirectTo: 'dashboard'},
      {path: 'home', component: HomeComponent},
      {path: 'empleados', component:Empleado},
    ]
  },
  {path: '**', redirectTo: 'dashboard'}
];
