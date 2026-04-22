import {inject, Injectable} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {SnackbarComponent, SnackbarData} from '../components/snackbar.component';


type SnackbarType = 'success' | 'error' | 'info';

@Injectable({providedIn: 'root'})
export class SnackbarService {
  private snackBar = inject(MatSnackBar);

  private readonly config: Record<SnackbarType, { class: string; icon: string }> = {
    success: {class: 'snackbar-success', icon: 'check_circle'},
    error: {class: 'snackbar-error', icon: 'report'},
    info: {class: 'snackbar-info', icon: 'info'}
  };

  private open(message: string, type: SnackbarType) {
    const {icon, class: panelClass} = this.config[type];

    this.snackBar.openFromComponent(SnackbarComponent, {
      duration: 3500,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: [`snackbar-${type}`],
      data: {message, icon, type} as SnackbarData
    });
  }
  success(msg: string) { this.open(msg, 'success'); }
  error(msg: string) { this.open(msg, 'error'); }
  info(msg: string) { this.open(msg, 'info'); }
}
