import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {RolApi} from '../data-acces/rol.api';
import {RolUpsert} from '../components/rol-upsert/rol-upsert';
import {CreateRolCommand} from '../data-acces/rol.model';
import {toSignal} from '@angular/core/rxjs-interop';
import {SnackbarService} from '../../../shared/services/snackbar.service';
import {IdentityResult} from '../../usuarios/data-access/user.model';
import {Router} from '@angular/router';

@Component({
  selector: 'app-rol-page',
  imports: [RolUpsert],
  template: `
    <app-rol-upsert
      (save)="onSave($event)"
      (cancel)="onCancel()"
      [permisos]="permisos()"
      [errors]="backendErrors()">
    </app-rol-upsert>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolPage {

  private readonly rolApi = inject(RolApi);
  private readonly router = inject(Router);
  private readonly snackbar = inject(SnackbarService);

  readonly backendErrors = signal<string[]>([]);
  readonly permisos = toSignal(this.rolApi.getAllPermisos(), {initialValue: []})

  onSave(command: CreateRolCommand) {

    this.backendErrors.set([]);

    this.rolApi.create(command).subscribe({
      next: (result: IdentityResult) => {
        if (result.success) {
          this.snackbar.success('Registrado con éxito');
          this.router.navigate(['/roles']);
        } else {
          this.backendErrors.set(result.errors);
        }
      },
      error: (errors: string[]) => {
        this.backendErrors.set(errors);
      }
    });
  }


  protected onCancel() {
    this.router.navigate(['/roles']);
  }
}
