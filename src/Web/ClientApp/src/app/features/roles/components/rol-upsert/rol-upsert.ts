import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-rol-upsert',
  imports: [],
  templateUrl: './rol-upsert.html',
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolUpsert {

}
