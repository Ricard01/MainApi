import {Component, computed, signal} from '@angular/core';
import {HeaderComponent} from "./header/header.component";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatButtonModule} from "@angular/material/button";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {RouterModule} from "@angular/router";
import {SidenavComponent} from "./sidenav/sidenav.component";


@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterModule, HeaderComponent, SidenavComponent, MatSidenavModule, MatButtonModule, MatProgressBarModule],
  template: `
    <mat-sidenav-container>

      <mat-sidenav opened mode="side" [style.width]="sidenavWidth()" class="nav-section">
        <app-sidenav [collapsed]="collapsed()"/>
      </mat-sidenav>

      <mat-sidenav-content class="content" [style.margin-left]="sidenavWidth()">

        <app-header [(collapsed)]="collapsed"/>

        <div class="p-4">
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
export class LayoutComponent {
  collapsed = signal(false);

  sidenavWidth = computed(() => (this.collapsed() ? '65px' : '250px'));

}
