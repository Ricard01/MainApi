import {ChangeDetectionStrategy, Component, inject, input, output, signal} from '@angular/core';
import {
  AbstractControl,
  FormsModule, NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from "@angular/forms";
import {RolListItem} from '../../../roles/data-acces/rol.model';

@Component({
  selector: 'app-user-create',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './user-create.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class UserCreate {

  private readonly fb = inject(NonNullableFormBuilder);
  roles = input<RolListItem[]>([]);

  save = output<any>();
  cancel = output<void>();

  hidePassword = signal(true);
  hideConfirmPassword = signal(true);

  errors = input<string[]>([]);

  form = this.fb.group({
    userName: ['', [Validators.required, Validators.pattern(/^\S+$/)]],
    nombre: ['', Validators.required],
    apellidoPaterno: ['', Validators.required],
    apellidoMaterno: [''],
    email: ['', Validators.email],
    telefono: [''],
    idRol: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/)]],
    confirmPassword: ['', Validators.required],
    imagenPerfilUrl: ['']
  }, {validators: [this.passwordsMatchValidator]});

  private passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPasswordCtrl = control.get('confirmPassword');
    const confirmPassword = confirmPasswordCtrl?.value;

    // Si ambos tienen texto y no son iguales
    if (password && confirmPassword && password !== confirmPassword) {
      // Le inyectamos el error directamente al input para que se ponga rojo
      confirmPasswordCtrl?.setErrors({...confirmPasswordCtrl.errors, mismatch: true});
      return {mismatch: true};
    }

    // Si ya son iguales, le quitamos el error al input
    if (confirmPasswordCtrl?.hasError('mismatch')) {
      const errors = {...confirmPasswordCtrl.errors};
      delete errors['mismatch'];
      confirmPasswordCtrl.setErrors(Object.keys(errors).length ? errors : null);
    }

    return null;
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.save.emit(this.form.getRawValue());
  }

}
