import {Component, input} from '@angular/core';
import { menuItems } from './menu-items';
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatListModule} from "@angular/material/list";
import {MatIconModule} from "@angular/material/icon";
import {MenuItemComponent} from "./menu-item/menu-item.component";
import SidenavHeaderComponent from "./sidenav-header/sidenav-header.component";
import {RouterModule} from "@angular/router";

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [MatSidenavModule, MatListModule, MatIconModule, MenuItemComponent, SidenavHeaderComponent, RouterModule],
  template:`

    <app-sidenav-header [collapsed]="collapsed()" />
    <mat-nav-list >
      @for (item of menuItems; track item.label) {
        <app-menu-item [item]="item" [collapsed]="collapsed()" />
      }
    </mat-nav-list>

  `,
  styles:`


  `,
})
export class SidenavComponent {

  collapsed = input<boolean>(false);

  menuItems = menuItems;
}
