import {Component} from '@angular/core';
import {UserForm} from '../components/user-form/user-form';

@Component({
  selector: 'app-user-page',
  imports: [UserForm],
  template: `
    <app-user-form>

    </app-user-form>
  `,
})
export class UserPage {

}
