import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  input,
  output,
  signal,
  viewChild
} from '@angular/core';
import {NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {AgenteAutocomplete} from '../../../../shared/components/agente-autocomplete/agente-autocomplete';
import {Agente} from '../../../../shared/models/agente.model';
import {DateInput} from '../../../../shared/components/date-input/date-input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {FacturaApi} from '../../data-acces/factura.api';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {FacturaHeaderValue, FacturaReadModel} from '../../data-acces/factura.model';

@Component({
  selector: 'app-factura-header',
  imports: [ReactiveFormsModule, AgenteAutocomplete, DateInput, MatFormFieldModule, MatDatepickerModule, MatInputModule, MatIconModule],
  templateUrl: './factura-header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FacturaHeader implements OnInit {

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly cotizacionApi = inject(FacturaApi);
  private readonly destroyRef = inject(DestroyRef);
  readonly personaMoralChange = output<boolean>();
  readonly observacionesAbiertas = signal(false);
  readonly editMode = input(false);
  readonly readOnly = input(false);
  readonly status = input<'pendiente' | 'facturada'>('pendiente');
  private readonly agenteAutocomplete = viewChild(AgenteAutocomplete);


  readonly form = this.fb.group({
    isPersonaMoral: [true],
    idAgente: [0],
    agente: [''],
    cliente: ['',[Validators.required, Validators.maxLength(50)]],
    fecha: [this.getFechaHoy(),  Validators.required],
    serie: [''],
    folio: ['',  Validators.required],
    contacto: ['', Validators.maxLength(20)],
    email: ['',Validators.maxLength(50)],
    telefono: ['',Validators.maxLength(50)],
    observaciones: ['', Validators.maxLength(3000)],
  });

  toggleObservaciones(): void {
    this.observacionesAbiertas.update(abiertas => !abiertas);
  }

  ngOnInit(): void {
    this.form.controls.isPersonaMoral.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => this.personaMoralChange.emit(value));

    if (this.editMode()) return;

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
    if (agente) {
      this.form.patchValue({
        idAgente: agente.id,
        agente: `${agente.codigo} - ${agente.nombre}`
      });
    } else {
      this.form.patchValue({
        idAgente: 0,
        agente: ''
      });
    }
  }

  isValid(): boolean {
    return this.form.valid;
  }

  markAsTouched(): void {
    this.form.markAllAsTouched();
  }

  getValue(): FacturaHeaderValue {
    return this.form.getRawValue();
  }

  setValue(cotizacion: FacturaReadModel): void {
    this.form.patchValue({
      isPersonaMoral: cotizacion.isPersonaMoral,
      idAgente: cotizacion.idAgente,
      agente: `${cotizacion.agenteCodigo} - ${cotizacion.agenteNombre}`,
      cliente: cotizacion.cliente,
      fecha: this.formatApiDate(cotizacion.fecha),
      serie: cotizacion.serie,
      folio: String(cotizacion.folio),
      contacto: cotizacion.contacto,
      email: cotizacion.email,
      telefono: cotizacion.telefono,
      observaciones: cotizacion.observaciones,
    });
    this.personaMoralChange.emit(cotizacion.isPersonaMoral);
    this.agenteAutocomplete()?.setSelection({
      id: cotizacion.idAgente,
      codigo: cotizacion.agenteCodigo,
      nombre: cotizacion.agenteNombre,
    });
  }

  private formatApiDate(value: string): string {
    const [year, month, day] = value.slice(0, 10).split('-');
    return year && month && day ? `${day}/${month}/${year}` : value;
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
