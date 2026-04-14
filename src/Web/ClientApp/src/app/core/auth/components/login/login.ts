import {Component, EventEmitter, inject, Input,  Output} from '@angular/core';
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {FormBuilder, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {LoginCommand} from "../../data-access/auth.models";

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatFormFieldModule, MatInputModule,  ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private fb = inject(FormBuilder);

  // Entradas de estado/control (propias de un componente de presentación)
  @Input() loading = false;
  @Input() error: string | null = null;
  @Input() logoSrc = '/assets/imgs/logoImss.png';


  @Output() login = new EventEmitter<LoginCommand>();

  showPassword = false;

  form = this.fb.group({
    userName: ['', [Validators.required]],
    password: ['', [Validators.required]],
    remember: [false],
  });

  submit() {
    if (this.form.invalid) return;

    const command: LoginCommand = {...this.form.value as LoginCommand};
    this.login.emit(command);
  }

}
