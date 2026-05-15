import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ExistenciaComponent } from '../../shared/components/existencia-costo';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-home',
  imports: [CommonModule, MatIconModule],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  private readonly dialog = inject(MatDialog);

  consultarExistencia() {
    this.dialog.open(ExistenciaComponent, {
      width: '450px',
      autoFocus: 'input',
    });
  }
  
}
