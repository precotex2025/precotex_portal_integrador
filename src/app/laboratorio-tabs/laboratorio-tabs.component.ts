import { Component } from '@angular/core';
import { MaterialModule } from '../material.module';
import { Router } from '@angular/router';

@Component({
  selector: 'app-laboratorio-tabs',
  templateUrl: './laboratorio-tabs.component.html',
  styleUrl: './laboratorio-tabs.component.scss'
})
export class LaboratorioTabsComponent {
  
  constructor(
    private router: Router
  ){}

  onTabChange(index: number) {
  const routes = ['/ColaTrabajo', '/HojaFormulacion', '/dispensado-autolab'];
  this.router.navigate([routes[index]]);
  }
}
