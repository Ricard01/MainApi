import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {AgenteAutocomplete} from '../../../../shared/components/agente-autocomplete';
import {Agente} from '../../../../shared/models/agente.model';
import {DateInput} from '../../../../shared/components/date-input/date-input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatCalendarCellClassFunction, MatDatepickerModule} from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';



@Component({
  selector: 'app-cotizacion-header',
  imports: [ReactiveFormsModule, AgenteAutocomplete, DateInput, MatFormFieldModule,MatDatepickerModule,MatInputModule],
  templateUrl: './cotizacion-header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CotizacionHeader {

  private readonly fb = inject(NonNullableFormBuilder);

  readonly form = this.fb.group({
    isPersonaMoral: [true],
    agente: [''],
    cliente: [''],
    fecha: [this.getFechaHoy()],
    serie: [''],
    folio: [''],
    contacto: [''],
    email: [''],
    telefono: [''],
  });

  onAgenteSeleccionado(agente: Agente | null) {
    this.form.controls.agente.setValue(agente?.nombre!);
  }

  dateClass: MatCalendarCellClassFunction<Date> = (cellDate, view) => {
    // Only highligh dates inside the month view.
    if (view === 'month') {
      const date = cellDate.getDate();

      // Highlight the 1st and 20th day of each month.
      return date === 1 || date === 20 ? 'example-custom-date-class' : '';
    }

    return '';
  };
  private getFechaHoy(): string {

    const hoy = new Date();

    return [
      String(hoy.getDate()).padStart(2, '0'),
      String(hoy.getMonth() + 1).padStart(2, '0'),
      hoy.getFullYear()
    ].join('/');
  }

}
