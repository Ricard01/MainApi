import {
  ApplicationConfig,
  InjectionToken,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
  isDevMode, LOCALE_ID
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
import {provideNativeDateAdapter} from '@angular/material/core';
import {registerLocaleData} from '@angular/common';
import localeEsMX from '@angular/common/locales/es-MX';

registerLocaleData(localeEsMX);
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');

export const appConfig: ApplicationConfig = {
  providers: [
    {provide: API_BASE_URL, useValue: '/api'},
    provideHttpClient(
      withFetch(),
      withInterceptors([errorInterceptor]
      )),
    //CALENDARIO EN ES
    provideNativeDateAdapter(),
    {
      provide: LOCALE_ID,
      useValue: 'es-MX'
    },
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
