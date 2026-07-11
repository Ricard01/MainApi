export enum CotizacionEstado {
  /** La cotización ha sido creada y está lista para ser enviada o procesada. */
  PENDIENTE = 'PENDIENTE',


  FACTURADA_PARCIAL = 'FACTURADA_PARCIAL',

  FACTURADA = 'FACTURADA',

  CANCELADA = 'CANCELADA'
}


// // En tu componente .ts
// public readonly ESTADOS_CONFIG = {
//   [CotizacionEstado.PENDIENTE]: { texto: 'Pendiente', clases: 'bg-amber-500', textoClase: 'text-amber-600 dark:text-amber-400' },
//   [CotizacionEstado.FACTURADA_PARCIAL]: { texto: 'Facturada Parcial', clases: 'bg-blue-500', textoClase: 'text-blue-600 dark:text-blue-400' },
//   [CotizacionEstado.FACTURADA]: { texto: 'Facturada', clases: 'bg-emerald-500', textoClase: 'text-emerald-600 dark:text-emerald-400' },
//   [CotizacionEstado.CANCELADA]: { texto: 'Cancelada', clases: 'bg-red-500', textoClase: 'text-red-600 dark:text-red-400' },
// };
//
// // Tu signal que maneja el estado actual
// public estadoActual = signal<CotizacionEstado>(CotizacionEstado.PENDIENTE);
//
// <span class="text-sm font-bold mt-0.5 flex items-center gap-1.5 {{ ESTADOS_CONFIG[estadoActual()].textoClase }}">
// <span class="h-2 w-2 rounded-full animate-pulse {{ ESTADOS_CONFIG[estadoActual()].clases }}"></span>
// {{ ESTADOS_CONFIG[estadoActual()].texto }}
// </span>
