import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {RolList} from '../components/rol-list/rol-list';

@Component({
  selector: 'app-rol-list-page',
  imports: [MatButtonModule, RolList],
  template: `
    <app-rol-list></app-rol-list>


  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RolListPage {

}
