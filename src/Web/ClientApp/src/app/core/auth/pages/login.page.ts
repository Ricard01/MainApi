import {Component, inject, OnInit} from '@angular/core';
import {Login} from "../components/login/login";
import {CommonModule} from "@angular/common";
import {LoginCommand} from "../data-access/auth.models";
import {AuthFacade} from '../data-access/state/auth.facade';
import {ActivatedRoute} from '@angular/router';


@Component({
  selector: 'app-login.page',
  imports: [CommonModule, Login],
  template: `
    <app-login
      [error]="(facade.error() ?? null)"
      (login)="onLogin($event)">
    </app-login>
  `,
})
export class LoginPage implements OnInit {
  private route = inject(ActivatedRoute);
  facade = inject(AuthFacade);

  private returnUrl = '/';

  ngOnInit(): void {
    const q = this.route.snapshot.queryParamMap.get('returnUrl');
    this.returnUrl = q && q.trim().length > 0 ? q : '/';
  }

  onLogin(command: LoginCommand) {
    this.facade.login(command, this.returnUrl);
  }

}
