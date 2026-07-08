import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  output,
  signal,
  viewChild,
  input
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OverlayModule, ConnectionPositionPair} from '@angular/cdk/overlay';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {toSignal} from '@angular/core/rxjs-interop';
import {catchError, debounceTime, distinctUntilChanged, firstValueFrom, map, of, startWith, switchMap} from 'rxjs';
import {ProductoApi} from '../../services/producto.api';
import {Producto} from '../../models/producto.model';
import {TipoProducto} from '../../enums/producto.enum';
import {EstatusCONTPAQi} from '../../enums/EstatusCONTPAQi.enum';


@Component({
  selector: 'producto-autocomplete',
  imports: [CommonModule, OverlayModule, ReactiveFormsModule],
  templateUrl: './producto-autocomplete.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ProductoAutocomplete {
  private readonly productoApi = inject(ProductoApi);
  readonly inputId = input('producto-search');
  readonly tiposProductos = input<TipoProducto[]>([TipoProducto.Producto, TipoProducto.Paquete]);
  readonly estatus = input<EstatusCONTPAQi | null>(EstatusCONTPAQi.Activo);

  // Emitimos el producto seleccionado al componente padre (o null si se borra)
  readonly productoSeleccionado = output<Producto | null>();
  readonly enterPressed = output<void>();
  private readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('inputElement');

  readonly isOverlayOpen = signal(false);
  readonly triggerWidth = signal<number | string>('100%');

  readonly activeItemIndex = signal<number>(-1);
  // Estado interno seleccionado para el bypass
  private currentSelection: Producto | null = null;


  readonly searchInput = new FormControl<string>('', {nonNullable: true});

  readonly overlayPositions = [
    new ConnectionPositionPair({originX: 'start', originY: 'bottom'}, {overlayX: 'start', overlayY: 'top'}, 0, 4),
    new ConnectionPositionPair({originX: 'start', originY: 'top'}, {overlayX: 'start', overlayY: 'bottom'}, 0, -4)
  ];

  readonly query = toSignal(
    this.searchInput.valueChanges.pipe(startWith('')),
    {initialValue: ''}
  );

  readonly productSearchResult = toSignal(
    this.searchInput.valueChanges.pipe(
      startWith(''),
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(value => {
        const term = value.trim();
        if (!term) return of({term, productos: []});

        return this.productoApi.search(term, this.tiposProductos(), this.estatus()).pipe(
          map(productos => ({term, productos})),
          catchError(() => of({term, productos: []}))
        );
      })
    ),
    {initialValue: {term: '', productos: []}}
  );

  readonly productos = computed(() => {
    const query = this.query().trim();
    const searchResult = this.productSearchResult();

    if (query !== searchResult.term) return [];

    return searchResult.productos;
  });

  constructor() {
    effect(() => {
      const items = this.filteredProductos();
      const hasQuery = this.query().trim().length > 0;

      if (this.isOverlayOpen() && hasQuery && items.length > 0) {
        this.activeItemIndex.set(0);
      } else if (items.length === 0) {
        this.activeItemIndex.set(-1);
      }
    });
  }

  readonly filteredProductos = computed(() => {
    const q = this.query().toLowerCase().trim();
    if (!q) return [];

    const all = this.productos();

    if (this.currentSelection) {
      const selectedLabel = `${this.currentSelection.codigo} - ${this.currentSelection.nombre}`.toLowerCase();
      if (q === selectedLabel) return all.slice(0, 20);
    }

    return all;
  });

  onInputFocus(event: Event): void {
    const currentInput = this.inputRef();
    if (currentInput) {
      this.triggerWidth.set(currentInput.nativeElement.offsetWidth);
    }
    this.isOverlayOpen.set(true);
    (event.target as HTMLInputElement).select();
  }

  onTyping(): void {
    if (this.currentSelection) {
      this.currentSelection = null;
      this.productoSeleccionado.emit(null);
    }
    this.activeItemIndex.set(-1); // Reiniciamos la navegación
    if (!this.isOverlayOpen()) {
      this.isOverlayOpen.set(true);
    }
  }

  selectProducto(p: Producto): void {
    this.currentSelection = p;
    this.searchInput.setValue(`${p.codigo} - ${p.nombre}`, {emitEvent: false});
    this.isOverlayOpen.set(false);
    this.activeItemIndex.set(-1);
    this.productoSeleccionado.emit(p); // Notificamos al padre
  }

  onKeyDown(event: KeyboardEvent): void {
    const items = this.filteredProductos();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault(); // Evita que el cursor se mueva dentro del input
        if (!this.isOverlayOpen()) this.isOverlayOpen.set(true);
        if (this.activeItemIndex() < items.length - 1) {
          this.activeItemIndex.update(i => i + 1);
          this.scrollToActiveItem();
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (this.activeItemIndex() > 0) {
          this.activeItemIndex.update(i => i - 1);
          this.scrollToActiveItem();
        }
        break;

      case 'Enter':
        // CASO 1: El overlay está abierto y hay opciones -> seleccionamos la activa o la primera.
        if (this.isOverlayOpen() && items.length > 0) {
          event.preventDefault();
          this.selectProducto(items[this.getSafeActiveIndex(items)]);
        }
        // CASO 2: El overlay está cerrado (ya seleccionó) -> Avisamos al padre para que consulte
        else if (!this.isOverlayOpen()) {
          event.preventDefault();
          this.enterPressed.emit();
        }
        break;

      case 'Tab': {
        const exactMatch = this.findExactCodeMatch(items);
        if (exactMatch) {
          this.selectProducto(exactMatch);
        } else if (this.query().trim().length > 0) {
          event.preventDefault();
          void this.selectExactCodeAndMoveFocus(event.shiftKey);
        } else {
          this.closeOverlay();
        }
        break;
      }

      case 'Escape':
        this.closeOverlay();
        break;
    }
  }

  closeOverlay(): void {
    this.isOverlayOpen.set(false);
  }

  private scrollToActiveItem(): void {
    setTimeout(() => {
      const activeEl = document.querySelector('.active-option.bg-primary');
      if (activeEl) {
        activeEl.scrollIntoView({block: 'nearest'});
      }
    }, 0);
  }

  private getSafeActiveIndex(items: Producto[]): number {
    const activeIndex = this.activeItemIndex();
    return activeIndex >= 0 && activeIndex < items.length ? activeIndex : 0;
  }

  private findExactCodeMatch(items: Producto[]): Producto | null {
    const query = this.normalizeCode(this.query());
    if (!query) return null;

    return items.find(item => this.normalizeCode(item.codigo) === query) ?? null;
  }

  private async selectExactCodeAndMoveFocus(reverse: boolean): Promise<void> {
    const term = this.query().trim();

    try {
      const productos = await firstValueFrom(
        this.productoApi.search(term, this.tiposProductos(), this.estatus()).pipe(
          catchError(() => of([]))
        )
      );

      const exactMatch = this.findExactCodeMatch(productos);
      if (exactMatch) {
        this.selectProducto(exactMatch);
      } else {
        this.closeOverlay();
      }
    } finally {
      this.focusAdjacentElement(reverse);
    }
  }

  private focusAdjacentElement(reverse: boolean): void {
    const currentInput = this.inputRef()?.nativeElement;
    if (!currentInput) return;

    const focusableElements = Array.from(
      document.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
      )
    ).filter(element => element.tabIndex >= 0 && element.offsetParent !== null);

    const currentIndex = focusableElements.indexOf(currentInput);
    const nextIndex = currentIndex + (reverse ? -1 : 1);
    const nextElement = focusableElements[nextIndex];

    if (nextElement) {
      nextElement.focus();
    } else {
      currentInput.blur();
    }
  }

  private normalizeCode(value: string): string {
    return value.trim().toLowerCase();
  }
}
