import {Component, effect, inject, input, output} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {User} from '../../data-access/user.model';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule],
  templateUrl: './user-form.html',
  styleUrl: './user-form.css',
})
export class UserForm {

  private fb = inject(FormBuilder);

  user = input<User | null>(null);
  save = output<any>();
  cancel = output<void>();

  userForm = this.fb.group({
    userName: ['', [Validators.required]],
    nombre: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    isActive: [true]
  });

  // Estado derivado
  isEdit = () => !!this.user();
  isAdmin = () => this.user()?.userName.toLowerCase() === 'adminstrador';

  constructor() {
    // Sincronizar el formulario cuando el input 'user' cambie
    effect(() => {
      const userData = this.user();
      if (userData) {
        this.userForm.patchValue(userData);
      } else {
        this.userForm.reset({isActive: true});
      }
    });
  }

  onSubmit() {
    if (this.userForm.valid) {
      this.save.emit(this.userForm.value);
    }
  }

}
