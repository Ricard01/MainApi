import {Component, inject, signal} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';
import {registerIcons} from './shared/icons/register-icons';
import {AuthFacade} from './core/auth/data-access/state/auth.facade';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <router-outlet/> `,
})
export class App {
  private facade = inject(AuthFacade);
  private registry = inject(MatIconRegistry);
  private sanitizer = inject(DomSanitizer);

  constructor() {
    registerIcons(this.registry, this.sanitizer);
    this.facade.checkSession();
  }
}
