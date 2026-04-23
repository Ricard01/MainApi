import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {UserApi} from '../../data-access/user.api';

@Component({
  selector: 'app-change-password-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './change-password.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChangePasswordDialog {

  protected ref = inject(MatDialogRef<ChangePasswordDialog>);
  private data = inject(MAT_DIALOG_DATA);
  private userApi = inject(UserApi);
  private fb = inject(NonNullableFormBuilder);

  protected loading = signal(false);
  protected errors = signal<string[]>([]);

  hidePassword = signal(true);
  hideConfirmPassword = signal(true);

  protected form = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/)]],
    confirmPassword: ['', [Validators.required]]
  }, {validators: [this.passwordsMatchValidator]});

  private passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('newPassword')?.value;
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


  save() {
    this.loading.set(true);
    const payload = {id: this.data.id, newPassword: this.form.getRawValue().newPassword};

    this.userApi.changePassword(payload).subscribe({
      next: () => this.ref.close(true), // Éxito: cerramos devolviendo true
      error: (err) => {
        this.loading.set(false);
        this.errors.set(err);
      }
    });
  }
}
