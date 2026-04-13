import {Component, inject, signal} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';
import {registerIcons} from './shared/icons/register-icons';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <router-outlet/> `,
})
export class App {

  private registry = inject(MatIconRegistry);
  private sanitizer = inject(DomSanitizer);

  constructor() {
    registerIcons(this.registry, this.sanitizer);
  }
}
