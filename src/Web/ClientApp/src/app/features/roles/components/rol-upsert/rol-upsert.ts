import {ChangeDetectionStrategy, Component, computed, inject, input, output} from '@angular/core';
import {NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {Permiso, PermisoGrupo} from '../../data-acces/rol.model';

@Component({
  selector: 'app-rol-upsert',
  imports: [ReactiveFormsModule,],
  templateUrl: './rol-upsert.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolUpsert {

  private readonly fb = inject(NonNullableFormBuilder);

  //inputs and Outputs siempre public
  permisos = input<Permiso[]>([]);
  save = output<any>();
  cancel = output<void>();
  errors = input<string[]>([]);

  form = this.fb.group({
    nombre: ['', Validators.required],
    descripcion: ['', Validators.required],
    permisosIds: this.fb.control<number[]>([], [Validators.required, Validators.minLength(1)]),
  });

  onSubmit() {
    if (this.form.invalid) return;
    this.save.emit(this.form.getRawValue());
  }

  togglePermiso(id: number, checked: boolean) {

    const permisos = this.form.controls.permisosIds.value ?? [];

    if (checked) {
      this.form.controls.permisosIds.setValue([...permisos, id]);
      return;
    }

    this.form.controls.permisosIds.setValue(
      permisos.filter(p => p !== id)
    );
  }

  hasPermiso(id: number): boolean {
    return this.form.controls.permisosIds.value?.includes(id) ?? false;
  }

  permisosAgrupados = computed<PermisoGrupo[]>(() => {
    const permisos = this.permisos();

    const grupos = permisos.reduce((acc, permiso) => {

      if (!acc[permiso.modulo]) {
        acc[permiso.modulo] = [];
      }

      acc[permiso.modulo].push(permiso);

      return acc;

    }, {} as Record<string, Permiso[]>);

    return Object.entries(grupos).map(([modulo, permisos]) => ({
      modulo,
      permisos
    }));
  });

}
