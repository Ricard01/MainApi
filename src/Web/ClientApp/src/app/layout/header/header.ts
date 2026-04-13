import {Component, EventEmitter, inject, Input, model,  Output} from '@angular/core';
import {MatToolbar} from "@angular/material/toolbar";
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from "@angular/material/button";
import {MatMenuModule} from "@angular/material/menu";
import {CommonModule} from "@angular/common";
import {ThemeService} from "../../core/services/theme.service";

@Component({
  selector: 'app-header',

  imports: [CommonModule, MatToolbar, MatIconModule, MatButtonModule, MatMenuModule,],
  template: `
    <mat-toolbar class="shadow-sm">

      <button mat-icon-button (click)="collapsed.set(!collapsed())" aria-label="menu">
        <mat-icon svgIcon="menu"></mat-icon>
      </button>

      <div class="flex-1"></div>

      <button mat-icon-button (click)="theme.toggle()">
        @if (theme.isDark()) {
          <mat-icon svgIcon="light_mode"></mat-icon>
        } @else {
          <mat-icon svgIcon="dark_mode"></mat-icon>
        }
      </button>

      <button mat-icon-button [matMenuTriggerFor]="profileMenu" class="overflow-hidden rounded-full">
        <img [src]="avatarUrl"
             [alt]="nombre ? ('Avatar de ' + nombre) : 'Avatar'"
             class="w-7 h-28px object-cover rounded-full"/>
      </button>

      <mat-menu #profileMenu="matMenu">
        <button mat-menu-item disabled>
          <mat-icon svgIcon="account_circle"></mat-icon>
          <span>{{ nombre || 'Usuario' }}</span>
        </button>
        <button mat-menu-item (click)="logout.emit()">
          <mat-icon svgIcon="logout"></mat-icon>
          <span>Cerrar sesión</span>
        </button>
      </mat-menu>

    </mat-toolbar>
  `,
  styles: `


  `,
})
export class Header {

  readonly theme = inject(ThemeService);

  @Input() nombre = '';
  @Input() avatarUrl: string | null = null;

  collapsed = model.required<boolean>();

  // Evento de logout (el contenedor llama al facade)
  @Output() logout = new EventEmitter<void>();


}
