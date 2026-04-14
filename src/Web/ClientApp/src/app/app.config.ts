import {  ApplicationConfig, InjectionToken,  provideBrowserGlobalErrorListeners,  provideZoneChangeDetection, isDevMode} from '@angular/core';
import {provideRouter} from '@angular/router';
import {routes} from './app.routes';
import {provideHttpClient, withFetch, withInterceptors} from '@angular/common/http';
import {provideStore} from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import {provideAuthFeature} from './core/auth/data-access/state/auth.state';

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: API_BASE_URL, useValue: '/api' },
    provideHttpClient(withFetch()),
    // DEFAULTS
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    // NGRX
    provideStore(),
    provideAuthFeature(),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() })
]
};
