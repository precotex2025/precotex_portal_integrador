import { Component } from '@angular/core';
import { MaterialModule } from '../material.module';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-laboratorio-tabs',
  templateUrl: './laboratorio-tabs.component.html',
  styleUrl: './laboratorio-tabs.component.scss'
})
export class LaboratorioTabsComponent {
  showTabs: boolean = true;
  selectedIndex: number = 0;
  
  constructor(private router: Router) { 
    this.router.events.subscribe(event => { 
      if (event instanceof NavigationEnd) { 
        const currentRoute = this.router.url; 
        this.showTabs = currentRoute !== '/login'; 
        if (currentRoute.startsWith('/ColaTrabajo')) { 
          this.selectedIndex = 0; 
        } else if (currentRoute.startsWith('/HojaFormulacion')) { 
          this.selectedIndex = 1; 
        } else if (currentRoute.startsWith('/DispensadoAutolab')) { 
          this.selectedIndex = 2; 
        } else if (currentRoute.startsWith('/Jabonados')) { 
          this.selectedIndex = 3; 
        } 
      } 
    }); 
  }

  onTabChange(index: number) {
  const routes = ['/ColaTrabajo', '/HojaFormulacion', '/DispensadoAutolab', '/Jabonados'];
  this.router.navigate([routes[index]]);
  }
}
