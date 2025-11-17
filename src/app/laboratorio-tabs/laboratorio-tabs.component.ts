import { Component } from '@angular/core';
import { MaterialModule } from '../material.module';
import { Router } from '@angular/router';

@Component({
  selector: 'app-laboratorio-tabs',
  templateUrl: './laboratorio-tabs.component.html',
  styleUrl: './laboratorio-tabs.component.scss'
})
export class LaboratorioTabsComponent {
  showTabs: boolean = true;

  constructor(
    private router: Router
  ){
    this.router.events.subscribe(() => {
      const currentRoute = this.router.url;
      this.showTabs = currentRoute !== '/login';
    });
  }

  onTabChange(index: number) {
  const routes = ['/ColaTrabajo', '/HojaFormulacion', '/DispensadoAutolab', '/Jabonados'];
  this.router.navigate([routes[index]]);
  }
}
