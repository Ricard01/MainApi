import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-rol-list',
  imports: [],
  templateUrl: './rol-list.html',
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolList {

}
