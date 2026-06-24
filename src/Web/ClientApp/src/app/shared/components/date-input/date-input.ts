import {ChangeDetectionStrategy, Component, forwardRef, OnInit, signal} from '@angular/core';
import {CommonModule } from '@angular/common';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors, Validator
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';

@Component({
  selector: 'date-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule,MatIconModule,MatDatepickerModule],
  templateUrl: './date-input.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateInput),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => DateInput),
      multi: true
    }
  ]
})
export class DateInput implements ControlValueAccessor, Validator, OnInit {

  value = signal<string>('');
  mostrarCalendario = signal<boolean>(false);

  private onChange = (_: string) => {};
  onTouched = () => {};

  ngOnInit(): void {
    if (!this.value()) {
      const fechaActual = this.formatDate(new Date());
      this.value.set(fechaActual);
      this.onChange(fechaActual);
    }
  }

  // ===============================
  // Bloqueo de Teclas (Keydown)
  // ===============================
  onKeyDown(event: KeyboardEvent): void {
    // Permitir teclas de control: Borrar, Tabulador, Flechas, Inicio, Fin
    const teclasPermitidas = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Home', 'End'];
    if (teclasPermitidas.includes(event.key)) return;

    // Permitir atajos de teclado como Ctrl+C, Ctrl+V, Ctrl+A
    if (event.ctrlKey || event.metaKey) return;

    // Si la tecla presionada NO es un número, evitamos que se escriba
    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    }
  }

  // ===============================
  // Captura y Formateo Inteligente
  // ===============================
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let numeros = input.value.replace(/\D/g, '').substring(0, 8);
    let fecha = '';

    // 1. Control del Día (máximo 31)
    if (numeros.length >= 2) {
      let dia = parseInt(numeros.substring(0, 2), 10);
      if (dia > 31) dia = 31;
      if (dia === 0) dia = 1;
      fecha += String(dia).padStart(2, '0');
    } else if (numeros.length === 1) {
      fecha += numeros.substring(0, 1);
    }

    // 2. Control del Mes (máximo 12)
    if (numeros.length >= 4) {
      let mes = parseInt(numeros.substring(2, 4), 10);
      if (mes > 12) mes = 12;
      if (mes === 0) mes = 1;
      fecha += '/' + String(mes).padStart(2, '0');
    } else if (numeros.length > 2) {
      fecha += '/' + numeros.substring(2, 4);
    }

    // 3. Control del Año
    if (numeros.length > 4) {
      fecha += '/' + numeros.substring(4, 8);
    }

    // Actualizamos el valor del input visible para reflejar las correcciones instantáneas
    input.value = fecha;

    this.value.set(fecha);
    this.onChange(this.value());
  }

  // ===============================
  // Integración con FormValidators
  // ===============================
  validate(control: AbstractControl): ValidationErrors | null {
    const val = control.value;

    // Si está vacío, dejamos que el validador 'Validators.required' decida si es error
    if (!val) return null;

    // Debe tener exactamente 10 caracteres (dd/MM/yyyy)
    if (val.length !== 10) return { fechaInvalida: true };

    const partes = val.split('/');
    if (partes.length !== 3) return { fechaInvalida: true };

    const dia = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10);
    const anio = parseInt(partes[2], 10);

    // Verificar años lógicos (ejemplo: mayor a 1900 y menor a 2100)
    if (anio < 1900 || anio > 2100) return { anioFueraDeRango: true };

    // Verificar si el día existe en ese mes de ese año específico (Magia para años bisiestos)
    const fechaObj = new Date(anio, mes - 1, dia);
    if (
      fechaObj.getFullYear() !== anio ||
      fechaObj.getMonth() !== mes - 1 ||
      fechaObj.getDate() !== dia
    ) {
      return { fechaInvalida: true }; // Ej: 30 de febrero dará error aquí
    }

    // Si todo está bien, retornamos null (sin errores)
    return null;
  }

  // ===============================
  // ControlValueAccessor
  // ===============================
  writeValue(value: string | null | undefined): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  // ===============================
  // Calendario y Utilidades
  // ===============================
  onCalendarSelected(date: Date | null): void {
    if (!date) return;
    const fechaFormateada = this.formatDate(date);
    this.value.set(fechaFormateada);
    this.onChange(fechaFormateada);
    this.mostrarCalendario.set(false);
  }

  toggleCalendar(): void {
    this.mostrarCalendario.update(estado => !estado);
  }

  private formatDate(date: Date): string {
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const anio = date.getFullYear();
    return `${dia}/${mes}/${anio}`;
  }
}
