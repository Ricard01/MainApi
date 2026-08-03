import {AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, inject, signal, viewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {CotizacionPreviewData} from './cotizacion-preview.model';
import {SnackbarService} from '../../../../shared/services/snackbar.service';

@Component({
  selector: 'app-cotizacion-preview',
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './cotizacion-preview.html',
  styleUrl: './cotizacion-preview.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CotizacionPreview implements AfterViewInit {
  private readonly quotePage = viewChild.required<ElementRef<HTMLElement>>('quotePage');
  private readonly multiPageStyleId = 'cotizacion-multipage-page-style';
  private readonly snackbar = inject(SnackbarService);
  protected readonly data = inject<CotizacionPreviewData>(MAT_DIALOG_DATA);
  protected readonly dialogRef = inject(MatDialogRef<CotizacionPreview>);
  protected readonly generandoPdf = signal(false);
  protected readonly hasDiscount = this.data.detalles.some(detalle => detalle.descuento > 0);
  protected readonly detailColumnCount = 5
    + (this.hasDiscount ? 1 : 0)
    + (this.data.header.isPersonaMoral ? 1 : 0);

  ngAfterViewInit(): void {
    if (this.data.descargarAlAbrir) {
      window.setTimeout(() => void this.descargarPdf(), 150);
    }
  }

  protected imprimir(): void {
    const tituloAnterior = document.title;
    document.title = this.fileBaseName();
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
      document.title = tituloAnterior;
      window.removeEventListener('afterprint', limpiarModoImpresion);
    };

    window.addEventListener('afterprint', limpiarModoImpresion);
    void document.body.offsetHeight;
    window.print();
    window.setTimeout(limpiarModoImpresion, 10 * 60_000);
  }

  protected async descargarPdf(): Promise<void> {
    if (this.generandoPdf()) return;

    this.generandoPdf.set(true);
    const element = this.quotePage().nativeElement;
    element.classList.add('pdf-export-mode');

    try {
      await document.fonts.ready;
      await this.waitForImages(element);

      const [{toCanvas}, {jsPDF}] = await Promise.all([
        import('html-to-image'),
        import('jspdf')
      ]);
      const captureWidth = element.offsetWidth;
      const captureHeight = element.offsetHeight;

      const canvas = await toCanvas(element, {
        backgroundColor: '#ffffff',
        cacheBust: true,
        pixelRatio: 2,
        width: captureWidth,
        height: captureHeight,
      });

      const pageWidthMm = 216;
      const pageHeightMm = 279;
      const nextPageTopMarginMm = 10;
      const multiPageBottomMarginMm = 8;
      const pixelsPerMm = canvas.width / pageWidthMm;
      const firstPageCapacity = Math.floor(pageHeightMm * pixelsPerMm);
      const nextPageCapacity = Math.floor(
        (pageHeightMm - nextPageTopMarginMm - multiPageBottomMarginMm) * pixelsPerMm
      );
      const totalPages = canvas.height <= firstPageCapacity
        ? 1
        : 1 + Math.ceil((canvas.height - firstPageCapacity) / nextPageCapacity);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [pageWidthMm, pageHeightMm],
        compress: true,
      });

      let sourceY = 0;

      for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
        if (pageIndex > 0) pdf.addPage([pageWidthMm, pageHeightMm], 'portrait');

        const targetY = pageIndex === 0 ? 0 : nextPageTopMarginMm;
        const capacity = pageIndex === 0 ? firstPageCapacity : nextPageCapacity;
        const sliceHeight = Math.min(capacity, canvas.height - sourceY);
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = sliceHeight;

        const context = pageCanvas.getContext('2d');
        if (!context) throw new Error('No fue posible preparar la página del PDF.');

        context.drawImage(
          canvas,
          0,
          sourceY,
          canvas.width,
          sliceHeight,
          0,
          0,
          canvas.width,
          sliceHeight
        );

        pdf.addImage(
          pageCanvas.toDataURL('image/png'),
          'PNG',
          0,
          targetY,
          pageWidthMm,
          sliceHeight / pixelsPerMm,
          undefined,
          'FAST'
        );

        sourceY += sliceHeight;
      }

      if (totalPages > 1) {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(92, 111, 107);

        for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
          pdf.setPage(pageNumber);
          pdf.text(
            `Página ${pageNumber} de ${totalPages}`,
            pageWidthMm - 10,
            pageHeightMm - 4,
            {align: 'right'}
          );
        }
      }

      const blob = pdf.output('blob');
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${this.fileBaseName()}.pdf`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 30_000);

      if (this.data.descargarAlAbrir) {
        this.dialogRef.close();
      }
    } catch (error) {
      console.error('No fue posible generar el PDF de la cotización.', error);
      this.snackbar.error('No fue posible generar el PDF de la cotización');

      if (this.data.descargarAlAbrir) {
        this.dialogRef.close();
      }
    } finally {
      element.classList.remove('pdf-export-mode');
      this.generandoPdf.set(false);
    }
  }

  private fileBaseName(): string {
    const serie = (this.data.header.serie ?? '')
      .trim()
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .toUpperCase();
    const folio = String(this.data.header.folio ?? '')
      .trim()
      .replace(/[^a-zA-Z0-9_-]/g, '');

    return `COT-${serie}${folio || 'SIN-FOLIO'}`;
  }

  private async waitForImages(container: HTMLElement): Promise<void> {
    const images = Array.from(container.querySelectorAll('img'));

    await Promise.all(images.map(async image => {
      if (!image.complete) {
        await new Promise<void>(resolve => {
          image.addEventListener('load', () => resolve(), {once: true});
          image.addEventListener('error', () => resolve(), {once: true});
        });
      }

      if (image.complete && image.naturalWidth > 0 && 'decode' in image) {
        await image.decode().catch(() => undefined);
      }
    }));
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
