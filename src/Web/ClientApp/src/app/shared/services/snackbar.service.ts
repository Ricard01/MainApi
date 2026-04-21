import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

type SnackbarType = 'success' | 'error' | 'info';

@Injectable({ providedIn: 'root' })
export class SnackbarService {

  private snackBar = inject(MatSnackBar);

  private config: Record<SnackbarType, string> = {
    success: 'snackbar-success',
    error: 'snackbar-error',
    info: 'snackbar-info'
  };

  open(message: string, type: SnackbarType) {
    this.snackBar.open(message, undefined, {
      duration: 3500,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: this.config[type]
    });
  }

  success(msg: string) { this.open(msg, 'success'); }
  error(msg: string) { this.open(msg, 'error'); }
  info(msg: string) { this.open(msg, 'info'); }
}
