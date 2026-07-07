import {ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, output} from '@angular/core';
import {NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {AgenteAutocomplete} from '../../../../shared/components/agente-autocomplete';
import {Agente} from '../../../../shared/models/agente.model';
import {DateInput} from '../../../../shared/components/date-input/date-input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {CotizacionApi} from '../../data-acces/cotizacion.api';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';


@Component({
  selector: 'app-cotizacion-header',
  imports: [ReactiveFormsModule, AgenteAutocomplete, DateInput, MatFormFieldModule, MatDatepickerModule, MatInputModule, MatIconModule],
  templateUrl: './cotizacion-header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CotizacionHeader implements OnInit {

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly cotizacionApi = inject(CotizacionApi);
  private readonly destroyRef = inject(DestroyRef);
  readonly personaMoralChange = output<boolean>();


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

  ngOnInit(): void {
    this.form.controls.isPersonaMoral.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => this.personaMoralChange.emit(value));

    this.cotizacionApi.getFolio()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (folioData) => {
        if (folioData) {
          this.form.patchValue({
            serie: folioData.serie,
            folio: String(folioData.folio)
          });
        }
      },
      error: (error) => {
        console.error('Error al obtener el folio de cotización:', error);
      }
    });
  }

  onAgenteSeleccionado(agente: Agente | null) {
    this.form.controls.agente.setValue(agente?.nombre!);
  }


  private getFechaHoy(): string {
    const hoy = new Date();

    return [
      String(hoy.getDate()).padStart(2, '0'),
      String(hoy.getMonth() + 1).padStart(2, '0'),
      hoy.getFullYear()
    ].join('/');
  }

}
