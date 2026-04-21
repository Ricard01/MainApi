import {
  ApplicationConfig,
  InjectionToken,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
  isDevMode
} from '@angular/core';
import {provideRouter} from '@angular/router';
import {routes} from './app.routes';
import {provideHttpClient, withFetch, withInterceptors,} from '@angular/common/http';
import {provideStore} from '@ngrx/store';
import {provideStoreDevtools} from '@ngrx/store-devtools';
import {provideAuthFeature} from './core/auth/data-access/state/auth.state';
import {translatePaginator} from './shared/custom/translatePaginator';
import {MatPaginatorIntl} from '@angular/material/paginator';
import {errorInterceptor} from './core/interceptors/error.interceptor';

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');

export const appConfig: ApplicationConfig = {
  providers: [
    {provide: API_BASE_URL, useValue: '/api'},
    provideHttpClient(
      withFetch(),
      withInterceptors([errorInterceptor]
      )),
    // DEFAULTS
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes),
    // NGRX
    provideStore(),
    provideAuthFeature(),
    provideStoreDevtools({maxAge: 25, logOnly: !isDevMode()}),

    // MATERIAL
    {provide: MatPaginatorIntl, useFactory: translatePaginator}
  ]
};
