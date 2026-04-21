import {ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal} from '@angular/core';
import {AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators} from '@angular/forms';
import {User} from '../../data-access/user.model';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {RolListItem} from '../../../roles/data-acces/rol.model';
import {MatSelectModule} from '@angular/material/select';
import {MatIconModule} from '@angular/material/icon';
import {toSignal} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatSelectModule],
  templateUrl: './user-form.html',
  styleUrl: './user-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserForm {

  private fb = inject(FormBuilder).nonNullable;
  public user = input<User | null>(null);
  public roles = input<RolListItem[]>([]);

  public isEditing = computed(() => !!this.user());
  public save = output<any>();
  public cancel = output<void>();
  hidePassword = signal(true);
  hideConfirmPassword = signal(true);
  public serverErrors = input<string[]>([]);


  // Para saber si mostramos las reglas (solo en modo creación y si el campo ha sido tocado o tiene foco)
  public showPassRules = computed(() => !this.isEditing());

  form = this.fb.group({
    id: [null as string | null],
    userName: ['', [Validators.required, Validators.pattern(/^\S+$/)]],
    nombre: ['', Validators.required],
    apellidoPaterno: ['', Validators.required],
    apellidoMaterno: [''],
    email: ['',  Validators.email],
    telefono: [''],
    idRol: ['', Validators.required],
    password: [null as string | null],
    confirmPassword: [null as string | null],
    isActive: [true],
    imagenPerfilUrl: ['']
  }, { validators: [this.passwordsMatchValidator] });

  private passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    const confirmPasswordCtrl = group.get('confirmPassword');

    // Si ambos campos tienen texto y no son iguales
    if (password && confirmPassword && password !== confirmPassword) {
      // Le inyectamos el error 'mismatch' directamente al control de confirmPassword
      confirmPasswordCtrl?.setErrors({ ...confirmPasswordCtrl.errors, mismatch: true });
      return { mismatch: true };
    }

    // Si ya son iguales, limpiamos el error 'mismatch' para que no se quede pegado
    if (confirmPasswordCtrl?.hasError('mismatch')) {
      const errors = { ...confirmPasswordCtrl.errors };
      delete errors['mismatch'];
      confirmPasswordCtrl.setErrors(Object.keys(errors).length ? errors : null);
    }

    return null;
  }
  // Usamos toSignal para escuchar los cambios del input en tiempo real
  private passwordValue = toSignal(
    this.form.controls.password.valueChanges,
    { initialValue: '' }
  );

  // Computamos las reglas dinámicamente
  public passRules = computed(() => {
    const pass = this.passwordValue() || '';
    return {
      length: pass.length >= 8,
      upper: /[A-Z]/.test(pass),
      lower: /[a-z]/.test(pass),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pass)
    };
  });


  constructor() {
    effect(() => {
      const user = this.user();
      const passwordCtrl = this.form.controls.password;
      const confirmPasswordCtrl = this.form.controls.confirmPassword;

      if (user) {
        // EDIT
        this.form.patchValue(user);

        passwordCtrl.setValue(null);
        confirmPasswordCtrl.setValue(null);
        passwordCtrl.clearValidators();
        confirmPasswordCtrl.clearValidators();

        this.form.controls.userName.disable();

      } else {
        // CREATE
        this.form.reset({
          id: null,
          isActive: true,
          password: null,
          confirmPassword: null
        });

        passwordCtrl.setValidators(Validators.required);
        confirmPasswordCtrl.setValidators(Validators.required);
        this.form.controls.userName.enable();
      }

      passwordCtrl.updateValueAndValidity();
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.save.emit(this.form.getRawValue());
  }


}
