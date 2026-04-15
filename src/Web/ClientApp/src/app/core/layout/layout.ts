import {Component, computed, inject, signal} from '@angular/core';
import {Header} from "./header/header";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatButtonModule} from "@angular/material/button";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {RouterModule} from "@angular/router";
import {Sidenav} from "./sidenav/sidenav";
import {AuthFacade} from '../auth/data-access/state/auth.facade';


@Component({
  selector: 'layout',
  imports: [RouterModule, Header, Sidenav, MatSidenavModule, MatButtonModule, MatProgressBarModule],
  template: `
    <mat-sidenav-container>

      <mat-sidenav opened mode="side" [style.width]="sidenavWidth()" class="nav-section">
        <sidenav [collapsed]="collapsed()"/>
      </mat-sidenav>

      <mat-sidenav-content class="flex flex-col h-full" [style.margin-left]="sidenavWidth()">

        <app-header
          (logout)="onLogout()"
          [(collapsed)]="collapsed"/>

        <div class="p-4 flex-1">
          <router-outlet></router-outlet>
        </div>


      </mat-sidenav-content>
    </mat-sidenav-container> `,
  styles: `

    /* altura completa */
    mat-sidenav-container {
      height: 100dvh;
    }

    mat-sidenav-content {
      transition: margin-left 500ms ease-in-out !important;
    }
    mat-sidenav {
      transition: width 500ms ease-in-out !important;
      --mat-sidenav-container-divider-color: var(--mat-sys-outline-variant);
      --mat-sidenav-container-shape: 0px;
    }
  `,
})
export class Layout {
  private auth = inject(AuthFacade);

  collapsed = signal(false);

  sidenavWidth = computed(() => (this.collapsed() ? '65px' : '250px'));

  onLogout() {
    this.auth.logout('Manual');
  }

}
