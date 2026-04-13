import { Component, computed, input, signal } from '@angular/core';
import { RouterLinkActive, RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MenuItem } from '../menu-items';

@Component({
  selector: 'app-menu-item',
  standalone: true,
  imports: [RouterModule, RouterLinkActive, MatListModule, MatIconModule],
  template: `
    <a
      mat-list-item
      [style.--mat-list-list-item-leading-icon-start-space]="indentation()"
      [routerLink]="fullRoute()"
      (click)="toggleIfHasChildren($event)"
      routerLinkActive
      #rla="routerLinkActive"
      [activated]="rla.isActive"
    >
      <mat-icon
        [svgIcon]="rla.isActive ? item().icon + '_filled' : item().icon "
        matListItemIcon
      ></mat-icon>

      @if (!collapsed()) {
        <span matListItemTitle>{{ item().label }}</span>
      }

      @if (item().subItems) {
        <span matListItemMeta>
          <mat-icon
            [fontIcon]="nestedItemOpen() ? 'expand_less' : 'expand_more'"
          ></mat-icon>
        </span>
      }
    </a>

    @if (item().subItems) {
      <div class="submenu" [class.open]="nestedItemOpen()">
        <div class="submenu-content">
          @for (subItem of item().subItems; track subItem.route) {
            <app-menu-item
              [item]="subItem"
              [routeHistory]="fullRoute()"
              [collapsed]="collapsed()"
            />
          }
        </div>
      </div>
    }
  `,
  styles: `
    :host * {
      transition: margin-inline-start 300ms ease, opacity 300ms ease;
    }


    .submenu {
      display: grid;
      grid-template-rows: 0fr;
      opacity: 0;
      transition: grid-template-rows 300ms ease, opacity 300ms ease;
    }

    .submenu.open {
      grid-template-rows: 1fr;
      opacity: 1;
    }

    .submenu-content {
      overflow: hidden;
    }
  `,
})
export class MenuItemComponent {

  item = input.required<MenuItem>();
  collapsed = input.required<boolean>();
  routeHistory = input('');

  nestedItemOpen = signal(false);

  level = computed(() => this.routeHistory().split('/').length - 1);

  indentation = computed(() =>
    this.collapsed() ? '16px' : `${16 + this.level() * 16}px`
  );

  fullRoute = computed(() =>
    `${this.routeHistory()}/${this.item().route}`
  );

  toggleIfHasChildren(event: Event) {
    if (this.item().subItems) {
      event.preventDefault(); // 👈 evita navegación si es solo contenedor
      this.nestedItemOpen.update(v => !v);
    }
  }
}
