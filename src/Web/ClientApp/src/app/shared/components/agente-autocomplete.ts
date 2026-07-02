import { ChangeDetectionStrategy, Component, ElementRef, computed, effect, inject, output, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayModule, ConnectionPositionPair } from '@angular/cdk/overlay';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs/operators';
import { AgenteApi } from '../services/agente.api';
import { Agente } from '../models/agente.model';



@Component({
  selector: 'agente-autocomplete',
  imports: [CommonModule, OverlayModule, ReactiveFormsModule],
  template: `
    <div class="flex flex-col gap-1 relative">
      <label for="agente-search" class="text-sm font-medium">Agente</label>

      <div cdkOverlayOrigin #trigger="cdkOverlayOrigin">
        <input id="agente-search"
               type="text"
               #inputElement
               [formControl]="searchInput"
               class="w-full rounded-md border border-outline bg-surface py-2 px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
               autocomplete="off"
               placeholder="Teclea el código o nombre..."
               (focus)="onInputFocus($event)"
               (click)="onInputFocus($event)"
               (input)="onTyping()"
               (keydown)="onKeyDown($event)"
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

        <ul id="autocomplete-list" class="bg-surface border border-outline-variant shadow-xl rounded-md mt-1 max-h-60 overflow-y-auto py-1 z-50" role="listbox">
          @for (agente of filteredAgentes(); track agente.id; let i = $index) {
            <li (mousedown)="$event.preventDefault(); selectAgente(agente)"
                (mouseenter)="activeItemIndex.set(i)"
                role="option"
                [attr.aria-selected]="activeItemIndex() === i"
                [class.bg-primary]="activeItemIndex() === i"
                [class.bg-opacity-10]="activeItemIndex() === i"
                class="px-4 py-2 cursor-pointer text-sm border-b border-outline-variant last:border-none transition-colors active-option {{ activeItemIndex() === i ? 'bg-primary/10 font-bold text-primary' : 'hover:bg-surface-variant text-on-surface' }}">
              <span class="font-bold text-primary">{{ agente.codigo }}</span> - {{ agente.nombre }}
            </li>
          } @empty {
            <li class="px-4 py-3 text-sm text-on-surface-variant italic text-center" role="alert">
              No se encontró el agente "{{ query() }}"
            </li>
          }
        </ul>
      </ng-template>
    </div>
  `,
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgenteAutocomplete {
  private readonly agenteApi = inject(AgenteApi);

  // Emitimos el agente seleccionado al componente padre (o null si se borra)
  readonly agenteSeleccionado = output<Agente | null>();

  private readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('inputElement');

  readonly isOverlayOpen = signal(false);
  readonly triggerWidth = signal<number | string>('100%');

  readonly activeItemIndex = signal<number>(-1);
  // Estado interno seleccionado para el bypass
  private currentSelection: Agente | null = null;

  // Mock para el ejemplo (reemplazar por toSignal(this.agenteApi.getAll()))
  readonly agentes = toSignal(this.agenteApi.getAll(), { initialValue: [] });

  readonly searchInput = new FormControl<string>('', { nonNullable: true });

  readonly overlayPositions = [
    new ConnectionPositionPair({ originX: 'start', originY: 'bottom' }, { overlayX: 'start', overlayY: 'top' }, 0, 4),
    new ConnectionPositionPair({ originX: 'start', originY: 'top' }, { overlayX: 'start', overlayY: 'bottom' }, 0, -4)
  ];

  readonly query = toSignal(
    this.searchInput.valueChanges.pipe(startWith('')),
    { initialValue: '' }
  );

  constructor() {
    effect(() => {
      const items = this.filteredAgentes();
      const hasQuery = this.query().trim().length > 0;

      if (this.isOverlayOpen() && hasQuery && items.length > 0) {
        this.activeItemIndex.set(0);
      } else if (items.length === 0) {
        this.activeItemIndex.set(-1);
      }
    });
  }

  readonly filteredAgentes = computed(() => {
    const q = this.query().toLowerCase().trim();
    if (!q) return [];

    const all = this.agentes();

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
    (event.target as HTMLInputElement).select();
  }

  onTyping(): void {
    if (this.currentSelection) {
      this.currentSelection = null;
      this.agenteSeleccionado.emit(null);
    }
    this.activeItemIndex.set(-1); // Reiniciamos la navegación
    if (!this.isOverlayOpen()) {
      this.isOverlayOpen.set(true);
    }
  }

  selectAgente(p: Agente): void {
    this.currentSelection = p;
    this.searchInput.setValue(`${p.codigo} - ${p.nombre}`, { emitEvent: false });
    this.isOverlayOpen.set(false);
    this.activeItemIndex.set(-1);
    this.agenteSeleccionado.emit(p); // Notificamos al padre
  }

  onKeyDown(event: KeyboardEvent): void {
    const items = this.filteredAgentes();

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
          this.selectAgente(items[this.getSafeActiveIndex(items)]);
        }
        // CASO 2: El overlay está cerrado (ya seleccionó) -> Avisamos al padre para que consulte
        else if (!this.isOverlayOpen()) {
          event.preventDefault();
          // this.enterPressed.emit();
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
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }, 0);
  }

  private getSafeActiveIndex(items: Agente[]): number {
    const activeIndex = this.activeItemIndex();
    return activeIndex >= 0 && activeIndex < items.length ? activeIndex : 0;
  }

  private findExactCodeMatch(items: Agente[]): Agente | null {
    const query = this.normalizeCode(this.query());
    if (!query) return null;

    return items.find(item => this.normalizeCode(item.codigo) === query) ?? null;
  }

  private normalizeCode(value: string): string {
    return value.trim().toLowerCase();
  }
}
