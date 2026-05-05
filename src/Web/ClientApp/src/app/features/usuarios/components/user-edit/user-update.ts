import {ChangeDetectionStrategy, Component, effect, inject, input, output} from '@angular/core';
import {NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {User} from '../../data-access/user.model';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {RolListItem} from '../../../roles/data-acces/rol.model';
import {MatSelectModule} from '@angular/material/select';
import {MatIconModule} from '@angular/material/icon';


@Component({
  selector: 'app-user-update',
  standalone: true,
  imports: [ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatSelectModule],
  templateUrl: './user-update.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserUpdate {

  private readonly fb = inject(NonNullableFormBuilder);
  user = input<User | null>(null);
  roles = input<RolListItem[]>([]);


  save = output<any>();
  cancel = output<void>();


  errors = input<string[]>([]);

  form = this.fb.group({
    userName: [{value: '', disabled: true}, [Validators.required, Validators.pattern(/^\S+$/)]],
    nombre: ['', Validators.required],
    apellidoPaterno: ['', Validators.required],
    apellidoMaterno: [''],
    email: ['', Validators.email],
    telefono: [''],
    idRol: ['', Validators.required],
    isActive: [true],
    imagenPerfilUrl: ['']
  });


  constructor() {
    effect(() => {
      const userData = this.user();

      if (userData) { // cuando ya exista el usuario se parchea
        this.form.patchValue(userData);
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.save.emit(this.form.getRawValue());
  }


}
