import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../material.module';
import { Router, NavigationEnd } from '@angular/router';
import Swal from 'sweetalert2';
import { LabColTrabajoService } from '../services/lab-col-trabajo/lab-col-trabajo.service';
import { AuthService } from '../authentication/auth.service';
@Component({
  selector: 'app-laboratorio-tabs',
  templateUrl: './laboratorio-tabs.component.html',
  styleUrl: './laboratorio-tabs.component.scss'
})
export class LaboratorioTabsComponent implements OnInit {
  showTabs: boolean = true;
  selectedIndex: number = 0;
  Usuario: string | null = null;
  constructor(
    private router: Router,
    private service: LabColTrabajoService,
    private authService: AuthService
  ) {
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

        localStorage.setItem('lastRoute', currentRoute);
      }
    });
  }

  ngOnInit(): void {
    this.Usuario = this.authService.getUsuario();

    const lastRoute = localStorage.getItem('lastRoute');
    if (lastRoute) {
      this.router.navigate([lastRoute]);
    }
  }

  // onTabChange(index: number) {
  // const routes = ['/ColaTrabajo', '/HojaFormulacion', '/DispensadoAutolab', '/Jabonados'];
  // this.router.navigate([routes[index]]);
  // }

  onTabChange(index: number) {
    const routes = ['/ColaTrabajo', '/HojaFormulacion', '/DispensadoAutolab', '/Jabonados'];
    const rutaSeleccionada = routes[index];
    const usr_cod = this.Usuario?.toString()!; // aquí obtienes el código del usuario logueado
    console.log(rutaSeleccionada);
    // this.service.getObtenerPermisoUsuario(usr_cod, rutaSeleccionada).subscribe(acceso => {
    //   if (acceso) {
    //     this.router.navigate([rutaSeleccionada]);
    //   } else {
    //     Swal.fire({
    //       icon: 'error',
    //       title: 'Acceso denegado',
    //       text: 'Usuario sin acceso a esta pestaña'
    //     });
    //   }
    // });
    let permitido: string = ''
    this.service.getObtenerPermisoUsuario(usr_cod, rutaSeleccionada).subscribe({
      next: (response: any) => {
        if (response.success){
          if (response.totalElements > 0){
            console.log(':::::::::::::::::.', response.elements);
            permitido = response.elements[0].permitido;
            // console.log(':::::::::::::::::.', permitido);
            // console.log(':::::::::::::::::.', usr_cod);
            // console.log(':::::::::::::::::.', rutaSeleccionada);
            this.authService.setPermiso(rutaSeleccionada, permitido);
            if(permitido.trim().toUpperCase() === 'S'){
              this.router.navigate([rutaSeleccionada]);
            }else{
              Swal.fire({
                icon: 'error',
                title: 'Acceso denegado',
                text: 'Usuario sin acceso a esta pestaña'
              });
            }
          }
        }
      },
      error: (error: any) => {

      }
    });
  }
}
