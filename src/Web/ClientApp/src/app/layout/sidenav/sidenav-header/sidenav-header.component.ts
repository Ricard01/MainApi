import { Component, computed,  input } from '@angular/core';


@Component({
  selector: 'app-sidenav-header',
  imports: [],
  template: `
    <div class="container">
      <img
        src="assets/imgs/logo.png"
        alt="Profile picture"
        class="avatar"
        [class.small]="collapsed()"/>

      <div
        class="info"
        [class.hidden]="collapsed()">
      </div>
    </div>
  `,
  styles: `
    .container {
      padding-top: 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .avatar {
      width: 100px;
      height: 100px;
      border-radius: 999px;
      transition: all 300ms ease;
    }

    .avatar.small {
      width: 32px;
      height: 32px;
    }

    .info {
      height: 3rem;
      overflow: hidden;
      transition: all 300ms ease;
    }

    .info.hidden {
      height: 0;
      opacity: 0;
    }

  `,
})
export default class SidenavHeaderComponent {
  collapsed = input(false);

  // appStore = inject(AppStore);

  profilePicSize = computed(() => (this.collapsed() ? '32' : '100'));
}
