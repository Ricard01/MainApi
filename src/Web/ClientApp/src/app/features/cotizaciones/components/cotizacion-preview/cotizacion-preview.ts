import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {CotizacionPreviewData} from './cotizacion-preview.model';

@Component({
  selector: 'app-cotizacion-preview',
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './cotizacion-preview.html',
  styleUrl: './cotizacion-preview.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CotizacionPreview {
  protected readonly data = inject<CotizacionPreviewData>(MAT_DIALOG_DATA);
  protected readonly dialogRef = inject(MatDialogRef<CotizacionPreview>);
  protected readonly hasDiscount = this.data.detalles.some(detalle => detalle.descuento > 0);
  protected readonly detailColumnCount = 5
    + (this.hasDiscount ? 1 : 0)
    + (this.data.header.isPersonaMoral ? 1 : 0);

  protected imprimir(): void {
    document.body.classList.add('cotizacion-print-mode');

    const limpiarModoImpresion = () => {
      document.body.classList.remove('cotizacion-print-mode');
      window.removeEventListener('afterprint', limpiarModoImpresion);
    };

    window.addEventListener('afterprint', limpiarModoImpresion);
    window.print();
    window.setTimeout(limpiarModoImpresion, 500);
  }
}
