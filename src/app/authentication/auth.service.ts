import { Injectable } from '@angular/core';
import { LabColTrabajoService } from '../services/lab-col-trabajo/lab-col-trabajo.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private usuario: string | null = null;
  private nombreUsuario: string | null = null;
  constructor(
    private service: LabColTrabajoService
  ) {
    this.usuario = localStorage.getItem('usuario');
    this.getGetUsuarioWeb(this.usuario);
  }

  setUsuario(usuario: string) {
    this.usuario = usuario;
    localStorage.setItem('usuario', usuario);
    this.getGetUsuarioWeb(usuario);
  }

  getUsuario(): string | null {
    return this.usuario;
  }

  logout() {
    this.usuario = null;
    localStorage.removeItem('usuario');
  }

  isLoggedIn(): boolean {
    return this.usuario !== null;
  }

  // getGetUsuarioWeb(Cod_Usuario: string | null): void {
  //   console.log('----ENTRA AL SERVICIO----');
  //   this.service.getGetUsuarioWeb(Cod_Usuario).subscribe({
  //     next: (response: any) => {
  //       if(response.success){
  //         console.log('Los elementos son: ', response.elements);
  //         this.nombreUsuario = response.elements[0].nom_Usuario;
  //         console.log(':::::', this.nombreUsuario);
  //       }
  //     },
  //     error: (error: any) => {

  //     }
  //   });
  // }

  getNombreUsuario(): string | null {
    return this.nombreUsuario
  }

  private nombreUsuarioSubject = new BehaviorSubject<string | null>(null);
  nombreUsuario$ = this.nombreUsuarioSubject.asObservable();

  getGetUsuarioWeb(Cod_Usuario: string | null): void {
    this.service.getGetUsuarioWeb(Cod_Usuario).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.nombreUsuario = response.elements[0].nom_Usuario;
          this.nombreUsuarioSubject.next(this.nombreUsuario);
        }
      }
    });
  }

  
}
