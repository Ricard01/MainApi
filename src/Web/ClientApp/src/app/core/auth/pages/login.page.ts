import {Component, inject, OnInit} from '@angular/core';

import {Login} from "../components/login/login";
import {CommonModule} from "@angular/common";
import {ActivatedRoute, Router} from "@angular/router";
import {LoginCommand} from "../data-access/auth.models";
import {AuthFacade} from '../data-access/state/auth.facade';


@Component({
  selector: 'app-login.page',
  standalone: true,
  imports: [CommonModule, Login],
  template: `
    <app-login
      [loading]="(facade.loading$ | async) ?? false"
      [error]="(facade.error$ | async) ?? null"
      (login)="onLogin($event)"
    >
    </app-login>
  `,
  styles: ``
})
export class LoginPage implements OnInit {
  facade = inject(AuthFacade);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private returnUrl = '/';

  ngOnInit(): void {
    // Leer returnUrl del querystring (p. ej. /login?returnUrl=/empleados)
    const q = this.route.snapshot.queryParamMap.get('returnUrl');
    this.returnUrl = q && q.trim().length > 0 ? q : '/';

    // UX: si ya hay sesión, no tiene caso mostrar login
    this.facade.isAuthenticated$.subscribe((ok) => {
      if (ok) this.router.navigateByUrl(this.returnUrl);
    });
  }

  onLogin(command: LoginCommand) {
    // Disparamos el login con el returnUrl efímero
    this.facade.login(command, this.returnUrl);
  }

}
