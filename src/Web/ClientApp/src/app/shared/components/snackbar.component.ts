import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MAT_SNACK_BAR_DATA, MatSnackBarRef} from '@angular/material/snack-bar';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {NgClass} from '@angular/common';

export interface SnackbarData {
  message: string;
  icon: string;
  type: 'success' | 'error' | 'info';
}

@Component({
  selector: 'app-custom-snackbar',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, NgClass],
  template: `
    <div class="snackbar-container" >
      <mat-icon [ngClass]="data.type">{{ data.icon }}</mat-icon>
      <span class="message ">{{ data.message }}</span>
      <button mat-icon-button (click)="snackBarRef.dismissWithAction()" class="close-btn">
        <mat-icon>close</mat-icon>
      </button>
    </div>
  `,
  styles: `
    .snackbar-container {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      /*color: red;*/
    }

    .message {
      flex: 1;
    }

    /* Colores basados en el estado */
    .success {
      color: #1e8e3e;
    }

    .error {
      color: var(--color-error);
    }

    .info {
      color: var(--color-primary);
    }

    .close-btn {
      /* Color automático para light/dark según el tema de Material */
      --mdc-icon-button-icon-color: var(--color-on-surface-variant);
      transform: scale(0.7); /* Reducción de escala para compactar */
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SnackbarComponent {

  protected data = inject<SnackbarData>(MAT_SNACK_BAR_DATA);
  protected snackBarRef = inject(MatSnackBarRef);
}


