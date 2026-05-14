import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import {
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { finalize } from 'rxjs';
import { ContpaqiApi } from '../data-access/contpaqi.api';
import { ContpaqiConexion } from '../data-access/contpaqi.model';
import { Router, RouterLink } from "@angular/router";

@Component({
  selector: 'app-contpaq-upsert',
  imports: [FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './contpaqi-upsert.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContpaqiUpsert implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly conexionApi = inject(ContpaqiApi);
  private readonly router = inject(Router);

  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly isUpdate = signal<boolean>(false);
  readonly successMessage = signal<string | null>(null);

  errors = input<string[]>([]);

  form = this.fb.group({
    servidor: ['', [Validators.required]],
    baseDatos: ['', Validators.required],
    sqlUser: ['', Validators.required],
    password: ['', Validators.required],
    puerto: [
      1433,
      [Validators.required, Validators.min(1), Validators.max(65535)],
    ],
  });

  ngOnInit(): void {
    this.conexionApi.get().subscribe({
      next: (config) => {
        if (config) {
          this.isUpdate.set(true);

          this.form.patchValue({
            servidor: config.servidor,
            baseDatos: config.baseDatos,
            sqlUser: config.sqlUser,
            puerto: config.puerto,
          });
        }

        // Como es actualización, la contraseña ya no es obligatoria
        this.form.controls.password.clearValidators();
        this.form.controls.password.updateValueAndValidity();
      },
      error: () => {
        this.errorMessage.set('Error al verificar la configuración existente.');
      },
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    // Mapeo perfecto gracias al tipado de NonNullableFormBuilder
    const payload = this.form.getRawValue() satisfies ContpaqiConexion;

    this.conexionApi
      .save(payload)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.successMessage.set('Conexión guardada correctamente.');

          // Si fue una inserción, a partir de ahora se convierte en actualización
          if (!this.isUpdate()) {
            this.isUpdate.set(true);
            this.form.controls.password.clearValidators();
            this.form.controls.password.updateValueAndValidity();
          }
          this.form.controls.password.reset(); // Limpiamos el campo de la contraseña por seguridad
        },
        error: (error: unknown) => {
          console.error('Error al guardar la conexión', error);
          this.errorMessage.set(
            'Ocurrió un error al guardar. Verifica la conexión con el servidor.',
          );
        },
      });
  }

  cancelar() {
    this.router.navigate(['/']);
  }

}
