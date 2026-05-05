import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login/login.service';
import { ToastrService } from 'ngx-toastr';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GlobalVariable } from '../../VarGlobals';
import { AuthService } from '../../authentication/auth.service';
import { LabColTrabajoService } from '../../services/lab-col-trabajo/lab-col-trabajo.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  Usuario: string | null = null;
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private matSnackBar: MatSnackBar,
    private loginService: LoginService,
    private authService: AuthService,
    private service: LabColTrabajoService
  ){}

  formularioLogin = this.formBuilder.group({
    Cod_Usuario: [''],
    Password: ['']
  });

  dataUsuariosHabilitados: Array<any> = [];
  dataUsuariosWeb: Array<any> = [];
  // async goColaTrabajo() {
  //   const routes = ['/ColaTrabajo', '/HojaFormulacion', '/DispensadoAutolab', '/Jabonados'];
  
  //   // this.service.getObtenerPermisoUsuario(this.Usuario, )
  //   // this.router.navigate(['/ColaTrabajo']);
  //   for (const ruta of routes) {
  //     try {
  //       const response: any = await this.service.getObtenerPermisoUsuario(this.Usuario!, ruta).toPromise();
  //       if (response.success && response.totalElements > 0) {
  //         const permitido = response.elements[0].permitido?.trim().toUpperCase();
  //         if (permitido === 'S') {
  //           console.log(ruta);
  //           this.router.navigate([ruta]);
  //           break;
  //         }
  //       }
  //     } catch (error) {
  //       console.error('Error validando acceso', error);
  //     }
  //   }
  // }

  // goColaTrabajo(){
  //   const routes = ['/ColaTrabajo', '/HojaFormulacion', '/DispensadoAutolab', '/Jabonados'];

  //   for (const ruta of routes){
  //     try {
  //       this.service.getObtenerPermisoUsuario(this.Usuario!, ruta).subscribe({
  //         next: (response: any) => {
  //           if(response.success){
  //             if (response.totalElements > 0) {
  //               const permitido = response.elements[0].permitido;
  //               if (permitido === 'S'){
  //                 console.log(ruta);
  //                 this.router.navigate([ruta]);
  //               }
  //             }
  //           }
  //         }
  //       });
  //     }catch{

  //     }
  //   }
  // }  

  async goColaTrabajo() {
    const routes = ['/ColaTrabajo', '/HojaFormulacion', '/DispensadoAutolab', '/Jabonados'];

    for (const ruta of routes) {
      try {
        const response: any = await firstValueFrom(this.service.getObtenerPermisoUsuario(this.Usuario!, ruta));
        if (response.success && response.totalElements > 0) {
          const permitido = response.elements[0].permitido?.trim().toUpperCase();
          if (permitido === 'S') {
            console.log('Acceso permitido a:', ruta);
            this.router.navigate([ruta]);
            break;
          }
        }
      } catch (error) {
        console.error('Error validando acceso', error);
      }
    }
  }


  onValidarUsuario(){
    
    let cod_Usuario = String(this.formularioLogin.get('Cod_Usuario')?.value).trim();
    this.dataUsuariosHabilitados = [];
    this.dataUsuariosWeb = [];

    this.Usuario = cod_Usuario;
    this.authService.setUsuario(cod_Usuario);
    // this.goColaTrabajo();

    
    if(cod_Usuario == '' || cod_Usuario == null){
      this.matSnackBar.open("Campo obligatorio", "Cerrar",
        {horizontalPosition:'center', verticalPosition:'top', duration: 1500}
      );
      return;
    }else{
      this.loginService.getUsuarioWeb(cod_Usuario).subscribe({
        next: (response: any) => {
          if (response.success && response.codeResult === 200) {
            this.dataUsuariosWeb = response.elements;
            let password = this.dataUsuariosWeb[0].password;
            let passwordText = this.formularioLogin.get('Password')?.value;
            if (passwordText?.toLowerCase() === password.toLowerCase()) {
              this.toastr.success('Bienvenido', '', { timeOut: 2500 });
              //console.log('Redireccionando a ColaTrabajo...');
              localStorage.setItem('usuario', cod_Usuario);
              this.authService.setUsuario(cod_Usuario);
              // GlobalVariable.vusu = localStorage.getItem('usuario') || '';

              // console.log('Usuario global seteado en:', GlobalVariable.vusu);
              this.goColaTrabajo();
            } else {
              this.matSnackBar.open("Contraseña Incorrecta", "Cerrar", {
                horizontalPosition: 'center',
                verticalPosition: 'top',
                duration: 1500
              });
            }
          } else {
            this.toastr.error(response.message || 'Error en validación de usuario web', 'Cerrar', {
              timeOut: 2500
            });
          }
        },
        error: (err) => {
          console.error('Error en getUsuarioWeb:', err);
          this.toastr.error('Error de conexión al validar usuario web', 'Cerrar', {
            timeOut: 2500
          });
        }
      });

    }
  }


}
