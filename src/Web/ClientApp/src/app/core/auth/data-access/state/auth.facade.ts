import {Injectable, inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {AuthActions} from './auth.actions';
import * as AuthSelectors from './auth.selectors';
import {LoginCommand} from '../auth.models';

@Injectable({providedIn: 'root'})
export class AuthFacade {
  private store = inject(Store);

  // FACADE es uso exclusivo de los componentes
  user = this.store.selectSignal(AuthSelectors.selectUser);
  loading = this.store.selectSignal(AuthSelectors.selectLoading);
  error = this.store.selectSignal(AuthSelectors.selectError);


  // Helpers de permisos
  hasPermission$(mask: number) {
    return this.store.selectSignal(AuthSelectors.selectHasPermission(mask));
  }

  // Triggers
  checkSession() {
    this.store.dispatch(AuthActions.checkSessionRequested());
  }

  login(command: LoginCommand, returnUrl?: string | null) {
    this.store.dispatch(AuthActions.loginRequested({command, returnUrl}));
  }

  logout(reason: 'Manual' | 'Inactivity' | 'Unknown' = 'Manual') {
    this.store.dispatch(AuthActions.logoutRequested({reason}));
  }

  clearError() {
    this.store.dispatch(AuthActions.clearError());
  }
}
