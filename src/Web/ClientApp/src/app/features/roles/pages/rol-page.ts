import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {RolApi} from '../data-acces/rol.api';
import {RolUpsert} from '../components/rol-upsert/rol-upsert';
import {RolFormValue} from '../data-acces/rol.model';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';
import {SnackbarService} from '../../../shared/services/snackbar.service';
import {IdentityResult} from '../../usuarios/data-access/user.model';
import {ActivatedRoute, Router} from '@angular/router';
import {map, of, switchMap} from 'rxjs';

@Component({
  selector: 'app-rol-page',
  imports: [RolUpsert],
  template: `
    <app-rol-upsert
      [rol]="rolToUpdate()"
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
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackbar = inject(SnackbarService);

  readonly backendErrors = signal<string[]>([]);
  readonly permisos = toSignal(this.rolApi.getAllPermisos(), {initialValue: []})

  private readonly rolId = toSignal(this.route.paramMap.pipe(map(p => p.get('id'))));

  rolToUpdate = toSignal(
    toObservable(this.rolId).pipe(
      switchMap(id => id ? this.rolApi.getById(id) : of(null))
    ),
    {initialValue: null}
  );


  onSave(form: RolFormValue) {

    this.backendErrors.set([]);
    const id = this.rolId();

    const request$ = id ? this.rolApi.update(id,
      {
        id,
        nombre: form.nombre,
        descripcion: form.descripcion,
        permisosIds: form.permisosIds
      }) : this.rolApi.create(form);


    request$.subscribe({
      next: (result: IdentityResult) => {
        if (result.success) {
          this.snackbar.success('Guardado con éxito');
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

  protected onCancel(): void {
    this.router.navigate(['/roles']);
  }

}
