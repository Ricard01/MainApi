import {Component, input} from '@angular/core';
import {items} from './menu/menu-items';
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatListModule} from "@angular/material/list";
import {MatIconModule} from "@angular/material/icon";
import {AppMenu} from "./menu/menu";
import Logo from "./logo/logo";
import {RouterModule} from "@angular/router";

@Component({
  selector: 'sidenav',
  standalone: true,
  imports: [MatSidenavModule, MatListModule, MatIconModule, AppMenu, Logo, RouterModule],
  template: `

    <logo [collapsed]="collapsed()"/>
    <mat-nav-list>

      @for (item of menuItems; track item.label) {
        <app-menu [item]="item" [collapsed]="collapsed()"/>
      }

    </mat-nav-list>
  `,
})
export class Sidenav {

  collapsed = input<boolean>(false);

  menuItems = items;
}
