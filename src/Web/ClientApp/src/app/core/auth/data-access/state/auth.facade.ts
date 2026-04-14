import {Injectable, inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {AuthActions} from './auth.actions';
import * as AuthSelectors from './auth.selectors';
import {LoginCommand} from '../auth.models';

@Injectable({providedIn: 'root'})
export class AuthFacade {
  private store = inject(Store);

  // FACADE es uso exclusivo de los componentes
  user$ = this.store.select(AuthSelectors.selectUser);
  loading$ = this.store.select(AuthSelectors.selectLoading);
  error$ = this.store.select(AuthSelectors.selectError);

  nombre$ = this.store.select(AuthSelectors.selectUserNombre);
  rol$ = this.store.select(AuthSelectors.selectUserRol);
  avatar$ = this.store.select(AuthSelectors.selectUserAvatar);

  // Helpers de permisos
  hasPermission$(mask: number) {
    return this.store.select(AuthSelectors.selectHasPermission(mask));
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
