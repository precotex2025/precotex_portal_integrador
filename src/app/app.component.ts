// import { Component, Inject, PLATFORM_ID } from '@angular/core';
// import { Router } from '@angular/router';
// import { NavigationEnd } from '@angular/router';
// import { NgxSpinnerService } from 'ngx-spinner';

// @Component({
//   selector: 'app-root',
//   templateUrl: './app.component.html',
//   styleUrl: './app.component.scss'
// })
// export class AppComponent {
//   title = 'precotex_portal_integrador';

//   isLoginRoute = true;

//   constructor(
//     private router: Router,
//     public SpinnerService: NgxSpinnerService) {
//     this.router.events.subscribe(event => {
//     if (event instanceof NavigationEnd) {
//       const currentRoute = event.urlAfterRedirects.toLowerCase();
//       this.isLoginRoute = currentRoute === '/login';
//     }
//     });
//   }

// }

import { Component, Inject, PLATFORM_ID, TemplateRef, ViewChild } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from './authentication/auth.service';
import screenfull from 'screenfull';
import { MatDialog } from '@angular/material/dialog';
import { Sort, MatSort } from '@angular/material/sort';
import { LabColTrabajoService } from './services/lab-col-trabajo/lab-col-trabajo.service';
import { MatTableDataSource } from '@angular/material/table';

interface data_color{
  corr_Carta: string,
  sec: string,
  descripcion_Color: string,
  cod_Color: string,
  dias_Lab: number,
  estandar_Tono_Comer: string,
  formulado: string,
  Flg_Est_Lab: string
}

interface SecuenciaOption {
  sec: string;
  descripcion_Color: string;
}


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']   // ojo: debe ser styleUrls en plural
})
export class AppComponent {
  title = 'precotex_portal_integrador';
  isLoginRoute = true;
  sdc: string | null = null; 
  secuencia: number = 0;
  @ViewChild('modalReporte') modalReporte!: TemplateRef<any>;
  @ViewChild(MatSort) sort!: MatSort;   
  dataSource: MatTableDataSource<data_color> = new MatTableDataSource();
  secuencias: SecuenciaOption[] = [];

  constructor(
    private router: Router,
    public SpinnerService: NgxSpinnerService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private authService: AuthService,
    private dialog: MatDialog,
    private LabColTrabajoService: LabColTrabajoService
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const currentRoute = event.urlAfterRedirects.toLowerCase();
        this.isLoginRoute = currentRoute === '/login';
      }
    });
  }
  
  ngOnInit(): void {
    // if (isPlatformBrowser(this.platformId)) {
    //   const isTablet = window.innerWidth >= 768 && window.innerWidth <= 1280;
    //   if (isTablet) {
    //     document.body.classList.add('modo-tablet');
    //   }
    // }
    if (this.authService.isLoggedIn()) { 
      console.log('Usuario activo:', this.authService.getUsuario()); 
      this.router.navigate(['/ColaTrabajo']);
    } else { 
      this.router.navigate(['/login']); 
    }

  if (window.innerWidth <= 1024) {
      document.body.classList.add('modo-tablet');
    }

  }

  irAMantenimientos(): void { 
    this.router.navigate(['/Mantenimientos']); 
  }

  cerrarSesion() {
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }

  alternarPantallaCompleta(): void { 
    if (screenfull.isEnabled) { 
      screenfull.toggle(); 
    } 
  }

  abrirModal(): void{
    this.dialog.open(this.modalReporte, { width: '400px' });
  }

  aceptar(): void { 
    if (this.sdc && this.secuencia) { 
      this.dialog.closeAll(); 
      this.router.navigate(['Reporte'], {
        queryParams: {
          sdcE: this.sdc,
          secuenciaE: this.secuencia
        }
      }); 
    } else { 
      alert('Por favor ingresa SDC y Secuencia'); 
    } 
  }

  dataListadoDetalle = []
  // onGetDetalle(){
  //   this.SpinnerService.show();
  //   this.dataListadoDetalle = [];
  //   this.LabColTrabajoService.getListaSDCDetalle(Corr_Carta).subscribe({
  //     next:(response: any) => {
  //       if(response.success){
  //         if(response.totalElements > 0){
  //           this.dataListadoDetalle = response.elements;
  //           console.log(this.dataListadoDetalle);
  //           this.dataSource.data = this.dataListadoDetalle;
  //           this.SpinnerService.hide();
  //         }else{
  //           this.SpinnerService.hide();
  //         };
  //       }
  //     },
  //     error:(error) => {
  //       this.SpinnerService.hide();
  //     }
  //   })
  // }

  onGetDetalle() {
    this.SpinnerService.show();
    this.secuencias = [];

    this.LabColTrabajoService.getListaSDCDetalle(this.sdc).subscribe({
      next: (response: any) => {
        if (response.success) {
          if (response.totalElements > 0) {
            this.secuencias = response.elements.map((item: any) => ({
              sec: item.sec,
              descripcion_Color: item.descripcion_Color
            }));
          }
        }
        this.SpinnerService.hide();
      },
      error: (error) => {
        this.SpinnerService.hide();
      }
    });
  }

  onlyNumberInput(event: KeyboardEvent) {
    const charCode = event.charCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }


}
