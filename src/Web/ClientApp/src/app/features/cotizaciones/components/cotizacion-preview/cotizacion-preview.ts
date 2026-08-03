import {ChangeDetectionStrategy, Component, ElementRef, inject, viewChild} from '@angular/core';
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
  private readonly quotePage = viewChild.required<ElementRef<HTMLElement>>('quotePage');
  private readonly multiPageStyleId = 'cotizacion-multipage-page-style';
  protected readonly data = inject<CotizacionPreviewData>(MAT_DIALOG_DATA);
  protected readonly dialogRef = inject(MatDialogRef<CotizacionPreview>);
  protected readonly hasDiscount = this.data.detalles.some(detalle => detalle.descuento > 0);
  protected readonly detailColumnCount = 5
    + (this.hasDiscount ? 1 : 0)
    + (this.data.header.isPersonaMoral ? 1 : 0);

  protected imprimir(): void {
    document.body.classList.add('cotizacion-print-mode');
    const isMultiPage = this.isMultiPage();

    if (isMultiPage) {
      document.body.classList.add('cotizacion-multipage-print');
      this.addMultiPagePrintStyle();
    }

    const limpiarModoImpresion = () => {
      document.body.classList.remove('cotizacion-print-mode');
      document.body.classList.remove('cotizacion-multipage-print');
      document.getElementById(this.multiPageStyleId)?.remove();
      window.removeEventListener('afterprint', limpiarModoImpresion);
    };

    window.addEventListener('afterprint', limpiarModoImpresion);
    void document.body.offsetHeight;
    window.print();
    window.setTimeout(limpiarModoImpresion, 60_000);
  }

  private isMultiPage(): boolean {
    const letterHeightInPixels = 279 * 96 / 25.4;
    return this.quotePage().nativeElement.getBoundingClientRect().height > letterHeightInPixels + 2;
  }

  private addMultiPagePrintStyle(): void {
    document.getElementById(this.multiPageStyleId)?.remove();

    const style = document.createElement('style');
    style.id = this.multiPageStyleId;
    style.textContent = `
      @page {
        size: 216mm 279mm;
        margin: 10mm 0 8mm;

        @bottom-right {
          content: "Página " counter(page) " de " counter(pages);
          padding-right: 10mm;
          color: #5c6f6b;
          font: 500 8pt Roboto, Arial, sans-serif;
        }
      }

      @page :first {
        margin-top: 0;
      }
    `;
    document.head.appendChild(style);
  }
}
