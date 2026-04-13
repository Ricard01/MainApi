import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

// material iCons Color #42454
export function registerIcons(registry: MatIconRegistry, sanitizer: DomSanitizer) {
  registry.addSvgIcon('menu', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/svg/menu.svg'));
  registry.addSvgIcon('light_mode', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/svg/light_mode.svg'));
  registry.addSvgIcon('dark_mode', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/svg/dark_mode.svg'));
  registry.addSvgIcon('expand_less', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/svg/expand_less.svg'));
  registry.addSvgIcon('expand_more', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/svg/expand_more.svg'));
  registry.addSvgIcon('home', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/svg/home.svg'));
  registry.addSvgIcon('home_filled', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/svg/home_filled.svg'));
  registry.addSvgIcon('user', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/svg/user.svg'));
  registry.addSvgIcon('user_filled', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/svg/user_filled.svg'));
  registry.addSvgIcon('rol', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/svg/rol.svg'));
  registry.addSvgIcon('rol_filled', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/svg/rol_filled.svg'));
  registry.addSvgIcon('badge', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/svg/employee.svg'));
  registry.addSvgIcon('search', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/svg/search.svg'));

  registry.addSvgIcon('account_circle', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/svg/account_circle.svg'));
  registry.addSvgIcon('logout', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/svg/logout.svg'));
  registry.addSvgIcon('add', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/svg/add.svg'));
  registry.addSvgIcon('save', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/svg/save.svg'));
  registry.addSvgIcon('edit', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/svg/edit_filled.svg'));
  registry.addSvgIcon('xls', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/svg/xls.svg'));
  registry.addSvgIcon('directions_car', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/svg/directions_car.svg'));
  registry.addSvgIcon('delete_forever', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/svg/delete_forever.svg'));
}
