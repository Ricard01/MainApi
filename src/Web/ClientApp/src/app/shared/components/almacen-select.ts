import { ChangeDetectionStrategy, Component, ElementRef, computed, input, output, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayModule, ConnectionPositionPair } from '@angular/cdk/overlay';
import { Almacen } from '../models/almacen.model';



@Component({
  selector: 'almacen-select',
  imports: [CommonModule, OverlayModule],
  template: `
    <div class="flex flex-col gap-1 relative">
      <label for="almacen-trigger" class="text-sm font-medium">Almacén</label>
      
      <div cdkOverlayOrigin #almacenOrigin="cdkOverlayOrigin">
        <button type="button"
                id="almacen-trigger"
                #almacenTrigger
                (click)="toggle()"
                class="w-full flex justify-between items-center rounded-md border border-outline bg-surface py-2 px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer transition-colors"
                aria-haspopup="listbox"
                [attr.aria-expanded]="isOpen()">
                
          <span class="truncate">
            @if (selectedAlmacen(); as almacen) {
             {{ almacen.codigo }} - {{ almacen.nombre }} 
            } @else {
              Seleccione un almacén
            }
          </span>
          
          <svg class="w-4 h-4 text-on-surface-variant transition-transform duration-200 {{ isOpen() ? 'rotate-180' : '' }}" 
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <ng-template cdkConnectedOverlay
                   [cdkConnectedOverlayOrigin]="almacenOrigin"
                   [cdkConnectedOverlayOpen]="isOpen()"
                   [cdkConnectedOverlayPositions]="overlayPositions"
                   [cdkConnectedOverlayWidth]="triggerWidth()"
                   [cdkConnectedOverlayHasBackdrop]="true"
                   cdkConnectedOverlayBackdropClass="cdk-overlay-transparent-backdrop"
                   (backdropClick)="isOpen.set(false)">
        
        <ul class="bg-surface border border-outline-variant shadow-xl rounded-md mt-1 max-h-60 overflow-y-auto py-1 z-50" role="listbox">
          @for (almacen of almacenes(); track almacen.id) {
            <li (click)="select(almacen.id)"
                role="option"
                [attr.aria-selected]="selectedId() === almacen.id"
                class="px-4 py-2 cursor-pointer text-sm border-b border-outline-variant last:border-none transition-colors flex justify-between items-center {{ selectedId() === almacen.id ? 'bg-primary/10 font-bold text-primary' : 'hover:bg-surface-variant text-on-surface' }}">
              
              <span>{{ almacen.nombre }} ({{ almacen.codigo }})</span>
              
              @if (selectedId() === almacen.id) {
                <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              }
            </li>
          } @empty {
            <li class="px-4 py-3 text-sm text-on-surface-variant italic text-center">
              No hay almacenes disponibles
            </li>
          }
        </ul>
      </ng-template>
    </div>
  `,
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlmacenSelect {
  // Inputs requeridos por el componente padre
  readonly almacenes = input<Almacen[]>([]);
  readonly selectedId = input<number | null>(null);
  
  // Output para notificar cuando el usuario selecciona una opción
  readonly almacenSeleccionado = output<number>();

  // Estado interno del menú desplegable
  readonly isOpen = signal(false);
  readonly triggerWidth = signal<number | string>('100%');
  private readonly almacenTriggerRef = viewChild<ElementRef<HTMLButtonElement>>('almacenTrigger');

  readonly overlayPositions = [
    new ConnectionPositionPair({ originX: 'start', originY: 'bottom' }, { overlayX: 'start', overlayY: 'top' }, 0, 4),
    new ConnectionPositionPair({ originX: 'start', originY: 'top' }, { overlayX: 'start', overlayY: 'bottom' }, 0, -4)
  ];

  // Calculamos dinámicamente qué almacén está seleccionado para mostrarlo en el botón
  readonly selectedAlmacen = computed(() => {
    const id = this.selectedId();
    return this.almacenes().find(a => a.id === id) ?? null;
  });

  toggle(): void {
    const trigger = this.almacenTriggerRef();
    if (trigger) {
      this.triggerWidth.set(trigger.nativeElement.offsetWidth);
    }
    this.isOpen.update(v => !v);
  }

  select(id: number): void {
    this.isOpen.set(false);
    this.almacenSeleccionado.emit(id);
  }
}