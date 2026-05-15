import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, output, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayModule, ConnectionPositionPair } from '@angular/cdk/overlay';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs/operators';
import { ProductoApi } from '../services/producto.api';
import { Producto } from '../models/producto.model';



@Component({
  selector: 'producto-autocomplete',
  imports: [CommonModule, OverlayModule, ReactiveFormsModule],
  template: `
    <div class="flex flex-col gap-1 relative">
      <label for="producto-search" class="text-sm font-medium">Producto (Código o Nombre)</label>
      
      <div cdkOverlayOrigin #trigger="cdkOverlayOrigin">
        <input id="producto-search"
               type="text"
               #inputElement
               [formControl]="searchInput"
               class="w-full rounded-md border border-outline bg-surface py-2 px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
               autocomplete="off"
               placeholder="Teclea el código o nombre..."
               (focus)="onInputFocus($event)"
               (click)="onInputFocus($event)"
               (input)="onTyping()"
               aria-autocomplete="list"
               role="combobox"
               [attr.aria-expanded]="isOverlayOpen()" />
      </div>

      <ng-template cdkConnectedOverlay
                   [cdkConnectedOverlayOrigin]="trigger"
                   [cdkConnectedOverlayOpen]="isOverlayOpen() && query().trim().length > 0"
                   [cdkConnectedOverlayPositions]="overlayPositions"
                   [cdkConnectedOverlayWidth]="triggerWidth()"
                   [cdkConnectedOverlayHasBackdrop]="true"
                   cdkConnectedOverlayBackdropClass="cdk-overlay-transparent-backdrop"
                   (backdropClick)="closeOverlay()">
        
        <ul class="bg-surface border border-outline-variant shadow-xl rounded-md mt-1 max-h-60 overflow-y-auto py-1 z-50" role="listbox">
          @for (producto of filteredProductos(); track producto.id) {
            <li (mousedown)="$event.preventDefault(); selectProducto(producto)"
                role="option"
                class="px-4 py-2 hover:bg-primary/10 cursor-pointer text-sm border-b border-outline-variant last:border-none transition-colors">
              <span class="font-bold text-primary">{{ producto.codigo }}</span> - {{ producto.nombre }}
            </li>
          } @empty {
            <li class="px-4 py-3 text-sm text-on-surface-variant italic text-center" role="alert">
              No se encontró el producto "{{ query() }}"
            </li>
          }
        </ul>
      </ng-template>
    </div>
  `,
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductoAutocomplete {
  private readonly productoApi = inject(ProductoApi);

  // Emitimos el producto seleccionado al componente padre (o null si se borra)
  readonly productoSeleccionado = output<Producto | null>();

  private readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('inputElement');
  
  readonly isOverlayOpen = signal(false);
  readonly triggerWidth = signal<number | string>('100%');
  
  // Estado interno seleccionado para el bypass
  private currentSelection: Producto | null = null;

  // Mock para el ejemplo (reemplazar por toSignal(this.productoApi.getAll()))
  readonly productos = toSignal(this.productoApi.getAll(), { initialValue: [] });

  readonly searchInput = new FormControl<string>('', { nonNullable: true });

  readonly overlayPositions = [
    new ConnectionPositionPair({ originX: 'start', originY: 'bottom' }, { overlayX: 'start', overlayY: 'top' }, 0, 4),
    new ConnectionPositionPair({ originX: 'start', originY: 'top' }, { overlayX: 'start', overlayY: 'bottom' }, 0, -4)
  ];

  readonly query = toSignal(
    this.searchInput.valueChanges.pipe(startWith('')), 
    { initialValue: '' }
  );

  readonly filteredProductos = computed(() => {
    const q = this.query().toLowerCase().trim();
    if (!q) return []; 

    const all = this.productos();

    if (this.currentSelection) {
      const selectedLabel = `${this.currentSelection.codigo} - ${this.currentSelection.nombre}`.toLowerCase();
      if (q === selectedLabel) return all.slice(0, 20);
    }

    const terms = q.replace(/-/g, ' ').split(' ').filter(t => t.length > 0);
    return all.filter(p => {
      const searchable = `${p.codigo} ${p.nombre}`.toLowerCase();
      return terms.every(term => searchable.includes(term));
    }).slice(0, 20);
  });

  onInputFocus(event: Event): void {
    const currentInput = this.inputRef();
    if (currentInput) {
      this.triggerWidth.set(currentInput.nativeElement.offsetWidth);
    }
    this.isOverlayOpen.set(true);

    const inputElement = event.target as HTMLInputElement;
    inputElement.select();
  }

  onTyping(): void {
    // Si el usuario empieza a escribir, invalidamos la selección anterior
    if (this.currentSelection) {
      this.currentSelection = null;
      this.productoSeleccionado.emit(null);
    }
  }

  selectProducto(p: Producto): void {
    this.currentSelection = p;
    this.searchInput.setValue(`${p.codigo} - ${p.nombre}`, { emitEvent: false });
    this.isOverlayOpen.set(false);
    this.productoSeleccionado.emit(p); // Notificamos al padre
  }

  closeOverlay(): void {
    this.isOverlayOpen.set(false);
  }
}