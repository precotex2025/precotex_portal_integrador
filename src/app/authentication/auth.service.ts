import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private usuario: string | null = null;

  constructor() {
    this.usuario = localStorage.getItem('usuario');
  }

  setUsuario(usuario: string) {
    this.usuario = usuario;
    localStorage.setItem('usuario', usuario);
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
}
