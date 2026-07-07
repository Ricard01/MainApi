import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  effect,
  inject,
  output,
  signal,
  viewChild,
  viewChildren
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {ConnectionPositionPair, OverlayModule} from '@angular/cdk/overlay';
import {startWith} from 'rxjs';
import {toSignal} from '@angular/core/rxjs-interop';
import {Agente} from '../../models/agente.model';
import {AgenteApi} from '../../services/agente.api';

@Component({
  selector: 'agente-autocomplete',
  standalone: true,
  imports: [CommonModule, OverlayModule, ReactiveFormsModule],
  templateUrl: './agente-autocomplete.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class AgenteAutocomplete {
  private readonly agenteApi = inject(AgenteApi);
  private readonly hostElement = inject(ElementRef<HTMLElement>);

  readonly agenteSeleccionado = output<Agente | null>();

  private readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('inputElement');
  private readonly optionElements = viewChildren<ElementRef<HTMLElement>>('optionElement');

  readonly isOverlayOpen = signal(false);
  readonly triggerWidth = signal<number | string>('100%');
  readonly activeItemIndex = signal(-1);


  private readonly currentSelection = signal<Agente | null>(null);

  readonly agentes = toSignal(this.agenteApi.getAll(), {initialValue: [] as Agente[],});
  readonly searchInput = new FormControl<string>('', {nonNullable: true});

  readonly query = toSignal(
    this.searchInput.valueChanges.pipe(startWith('')),
    {initialValue: ''}
  );

  readonly isPanelVisible = computed(() => {
    return this.isOverlayOpen() && this.query().trim().length > 0;
  });

  readonly overlayPositions = [
    new ConnectionPositionPair(
      {originX: 'start', originY: 'bottom'},
      {overlayX: 'start', overlayY: 'top'},
      0,
      4
    ),
    new ConnectionPositionPair(
      {originX: 'start', originY: 'top'},
      {overlayX: 'start', overlayY: 'bottom'},
      0,
      -4
    ),
  ];

  readonly filteredAgentes = computed(() => {
    const query = this.query().toLowerCase().trim();

    if (!query) {
      return [];
    }

    const agentes = this.agentes();
    const selection = this.currentSelection();

    /**
     * Al volver a enfocar un agente ya elegido,
     * muestra nuevamente las opciones disponibles.
     */
    if (selection) {
      const selectedLabel =
        `${selection.codigo} - ${selection.nombre}`.toLowerCase();

      if (query === selectedLabel) {
        return agentes.slice(0, 20);
      }
    }

    const terms = query
      .replace(/-/g, ' ')
      .split(' ')
      .filter(term => term.length > 0);

    return agentes
      .filter(agente => {
        const searchable =
          `${agente.codigo} ${agente.nombre}`.toLowerCase();

        return terms.every(term => searchable.includes(term));
      })
      .slice(0, 20);
  });

  constructor() {
    effect(() => {
      const items = this.filteredAgentes();

      if (!this.isPanelVisible() || items.length === 0) {
        this.activeItemIndex.set(-1);
        return;
      }

      const currentIndex = this.activeItemIndex();

      if (currentIndex < 0 || currentIndex >= items.length) {
        this.activeItemIndex.set(0);
      }
    });
  }

  @HostListener('document:mousedown', ['$event'])
  onDocumentMouseDown(event: MouseEvent): void {
    if (!this.isOverlayOpen()) {
      return;
    }

    const target = event.target;

    if (!(target instanceof Element)) {
      return;
    }

    const clickedInsideComponent =
      this.hostElement.nativeElement.contains(target);

    const clickedInsideOverlay =
      target.closest('.agente-autocomplete-panel') !== null;

    if (!clickedInsideComponent && !clickedInsideOverlay) {
      this.closeOverlay();
    }
  }

  onInputFocus(event: Event): void {
    const input = this.inputRef();

    if (input) {
      this.triggerWidth.set(input.nativeElement.offsetWidth);
    }

    this.isOverlayOpen.set(true);

    (event.target as HTMLInputElement).select();
  }

  onTyping(): void {
    if (this.currentSelection()) {
      this.currentSelection.set(null);
      this.agenteSeleccionado.emit(null);
    }

    this.activeItemIndex.set(-1);

    if (!this.isOverlayOpen()) {
      this.isOverlayOpen.set(true);
    }
  }

  onOptionMouseDown(event: MouseEvent, agente: Agente): void {
    /**
     * Evita que el input pierda foco antes de seleccionar.
     */
    event.preventDefault();

    this.selectAgente(agente);
  }

  selectAgente(agente: Agente): void {
    this.currentSelection.set(agente);

    this.searchInput.setValue(`${agente.codigo} - ${agente.nombre}`);

    this.isOverlayOpen.set(false);
    this.activeItemIndex.set(-1);

    this.agenteSeleccionado.emit(agente);
  }

  onKeyDown(event: KeyboardEvent): void {
    const items = this.filteredAgentes();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();

        if (!this.isOverlayOpen()) {
          this.isOverlayOpen.set(true);
        }

        if (!items.length) {
          return;
        }

        if (this.activeItemIndex() < items.length - 1) {
          this.activeItemIndex.update(index => index + 1);
        } else {
          this.activeItemIndex.set(0);
        }

        this.scrollToActiveItem();
        break;

      case 'ArrowUp':
        event.preventDefault();

        if (!items.length) {
          return;
        }

        if (this.activeItemIndex() > 0) {
          this.activeItemIndex.update(index => index - 1);
        } else {
          this.activeItemIndex.set(items.length - 1);
        }

        this.scrollToActiveItem();
        break;

      case 'Enter':
        if (this.isPanelVisible() && items.length > 0) {
          event.preventDefault();

          const selectedIndex = this.getSafeActiveIndex(items);
          this.selectAgente(items[selectedIndex]);
        }

        break;

      case 'Tab': {
        const exactMatch = this.findExactCodeMatch(items);

        if (exactMatch) {
          this.selectAgente(exactMatch);
        } else {
          this.closeOverlay();
        }

        break;
      }

      case 'Escape':
        event.preventDefault();
        this.closeOverlay();
        break;
    }
  }

  closeOverlay(): void {
    this.isOverlayOpen.set(false);
    this.activeItemIndex.set(-1);
  }

  private scrollToActiveItem(): void {
    requestAnimationFrame(() => {
      const activeIndex = this.activeItemIndex();
      const activeOption = this.optionElements()[activeIndex];

      activeOption?.nativeElement.scrollIntoView({
        block: 'nearest',
      });
    });
  }

  private getSafeActiveIndex(items: Agente[]): number {
    const activeIndex = this.activeItemIndex();

    return activeIndex >= 0 && activeIndex < items.length
      ? activeIndex
      : 0;
  }

  private findExactCodeMatch(items: Agente[]): Agente | null {
    const query = this.normalizeCode(this.query());

    if (!query) {
      return null;
    }

    return (
      items.find(item => this.normalizeCode(item.codigo) === query) ?? null
    );
  }

  private normalizeCode(value: string): string {
    return value.trim().toLowerCase();
  }
}
