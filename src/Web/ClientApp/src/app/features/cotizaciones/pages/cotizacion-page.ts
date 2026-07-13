import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {CotizacionHeader} from '../components/cotizacion-header/cotizacion-header';
import {CotizacionDetail} from '../components/cotizacion-detail/cotizacion-detail';
import {Router} from '@angular/router';
import {MatIcon} from '@angular/material/icon';


@Component({
  selector: 'app-cotizacion-page',
  imports: [CotizacionHeader, CotizacionDetail, MatIcon],
  template: `
    <div class="mb-3">
      <button type="button" (click)="onRegresar()"
        class="inline-flex items-center gap-1.5 text-sm font-medium text-on-surface-variant/75 hover:text-primary transition-colors duration-250 bg-transparent border-none p-0 cursor-pointer group">
        <mat-icon class="text-base h-5 w-5 flex items-center justify-center transform group-hover:-translate-x-0.5 transition-transform">
          arrow_back
        </mat-icon>
          Cotizaciones
      </button>
    </div>

    <app-cotizacion-header (personaMoralChange)="isPersonaMoral.set($event)"></app-cotizacion-header>
    <app-cotizacion-detail [isPersonaMoral]="isPersonaMoral()"></app-cotizacion-detail>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CotizacionPage {
  readonly isPersonaMoral = signal(true);
  private readonly router = inject(Router);

  onRegresar() {
    this.router.navigate(['/cotizaciones']);
  }

  // onSave(){
  //   this.cotizacionApi.create(command)
  //     .subscribe({
  //       next: data => { }
  //     })
  //
  // }



}
