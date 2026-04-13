import { Injectable, signal, effect } from '@angular/core';

/**
 * Tema soportado por la app.
 * Solo manejamos light/dark → no hay "sys" como estado persistido.
 */
export type TTheme = 'theme-light' | 'theme-dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  /**
   * Clave usada para persistir el tema en localStorage.
   * Permite recordar la preferencia del usuario entre sesiones.
   */
  private readonly storageKey = 'app-theme';

  /**
   * Estado interno del tema usando signals (reactividad nativa de Angular).
   */
  private _theme = signal<TTheme>('theme-light');

  /**
   * Exposición readonly del estado para evitar mutaciones externas.
   */
  readonly theme = this._theme.asReadonly();

  constructor() {
    // Inicializa el tema (localStorage o sistema)
    this.init();

    // Sincroniza cambios del signal → DOM + localStorage
    this.syncDom();

    // Escucha cambios de otras pestañas
    this.listenStorage();
  }

  /**
   * Determina el tema inicial:
   * 1. Si hay valor guardado → se respeta (usuario manda)
   * 2. Si no → se usa preferencia del sistema
   */
  private init() {
    const saved = localStorage.getItem(this.storageKey) as TTheme | null;

    if (saved) {
      this._theme.set(saved);
      return;
    }

    // Solo aquí usamos prefers-color-scheme (no es un estado persistido)
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this._theme.set(prefersDark ? 'theme-dark' : 'theme-light');
  }

  /**
   * Efecto reactivo:
   * Cada vez que cambia el tema:
   * - Actualiza clases en <html> (fuente de verdad visual)
   * - Persiste en localStorage
   *
   * Esto conecta Angular → CSS (Material + Tailwind)
   */
  private syncDom() {
    effect(() => {
      const value = this._theme();

      const root = document.documentElement;

      // Limpiamos ambos estados para evitar conflictos
      root.classList.remove('theme-light', 'theme-dark');

      // Aplicamos el actual (esto activa Material + Tailwind)
      root.classList.add(value);

      // Persistimos la elección del usuario
      localStorage.setItem(this.storageKey, value);
    });
  }

  /**
   * Sincronización entre pestañas:
   * Cuando otra pestaña cambia el tema,
   * este listener actualiza el signal local.
   *
   * Nota:
   * - El evento 'storage' NO se dispara en la misma pestaña
   * - Solo en otras pestañas abiertas del mismo origen
   */
  private listenStorage() {
    window.addEventListener('storage', (event) => {
      if (event.key !== this.storageKey) return;

      const value = event.newValue as TTheme;
      if (!value) return;

      // Actualiza estado → dispara effect → actualiza UI
      this._theme.set(value);
    });
  }

  /**
   * Alterna entre light y dark.
   * Ideal para botones tipo switch/icon.
   */
  toggle() {
    this._theme.update(t => (t === 'theme-dark' ? 'theme-light' : 'theme-dark'));
  }

  /**
   * Permite setear el tema explícitamente (ej: toggle group).
   */
  set(theme: TTheme) {
    this._theme.set(theme);
  }

  /**
   * Helper para UI (evita lógica en templates).
   */
  isDark() {
    return this._theme() === 'theme-dark';
  }
}
