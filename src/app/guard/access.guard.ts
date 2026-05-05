import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { LabColTrabajoService } from '../services/lab-col-trabajo/lab-col-trabajo.service';
import { AuthService } from '../authentication/auth.service';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class AccessGuard implements CanActivate {
    constructor(
        private service: LabColTrabajoService,
        private authService: AuthService,
        private router: Router
    ) { }

    async canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
        // Recupera el usuario desde AuthService o localStorage
        const usr_cod = this.authService.getUsuario() || localStorage.getItem('usuario');
        const ruta = '/' + route.routeConfig?.path;

        if (!usr_cod) {
            this.router.navigate(['/login']);
            return false;
        }

        try {
            const response: any = await firstValueFrom(this.service.getObtenerPermisoUsuario(usr_cod, ruta));
            if (response.success && response.totalElements > 0) {
                const permitido = response.elements[0].permitido?.trim().toUpperCase();
                if (permitido === 'S') {
                    // Guarda la última ruta válida para restaurarla en caso de F5
                    localStorage.setItem('lastRoute', ruta);
                    return true;
                }
            }
            Swal.fire('Acceso denegado', 'Usuario sin acceso', 'error');
            
            const lastRoute = localStorage.getItem('lastRoute');
            if (lastRoute) {
                this.router.navigate([lastRoute]);
            }else{
                this.router.navigate(['/login']);
            }
            return false;
        } catch (error) {
            console.error('Error en guard:', error);
            this.router.navigate(['/login']);
            return false;
        }
    }
}
