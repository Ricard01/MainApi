import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { AUTH_FEATURE_KEY, authReducer } from './auth.reducer';
import { AuthEffects } from './auth.effects';

export function provideAuthFeature() {
  return [
    provideState(AUTH_FEATURE_KEY, authReducer),
    provideEffects([AuthEffects]),
  ];
}
