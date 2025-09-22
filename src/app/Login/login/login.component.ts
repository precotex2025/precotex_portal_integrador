import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login/login.service';
import { ToastrService } from 'ngx-toastr';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private matSnackBar: MatSnackBar,
    private loginService: LoginService
  ){}

  formularioLogin = this.formBuilder.group({
    Cod_Usuario: [''],
    Password: ['']
  });

  dataUsuariosHabilitados: Array<any> = [];
  dataUsuariosWeb: Array<any> = [];
  goColaTrabajo() {
    this.router.navigate(['/ColaTrabajo']);
  }

  onValidarUsuario(){

    let cod_Usuario = String(this.formularioLogin.get('Cod_Usuario')?.value).trim();
    this.dataUsuariosHabilitados = [];
    this.dataUsuariosWeb = [];
    
    if(cod_Usuario == '' || cod_Usuario == null){
      this.matSnackBar.open("Campo obligatorio", "Cerrar",
        {horizontalPosition:'center', verticalPosition:'top', duration: 1500}
      );
      return;
    }else{
      this.loginService.getUsuarioHabilitado(cod_Usuario).subscribe({
      next:(response: any) => {
        if(response.success){
          if(response.codeResult == 200){
            this.dataUsuariosHabilitados = response.elements;
            
            let respuesta = this.dataUsuariosHabilitados[0].respuesta;  

            console.log(respuesta);
            if(respuesta === "OK"){

              this.loginService.getUsuarioWeb(cod_Usuario).subscribe({
                next:(response: any) => {
                  if(response.success){
                    if(response.codeResult == 200){
                      this.dataUsuariosWeb = response.elements;
                      let password = this.dataUsuariosWeb[0].password;
                      let passwordText = this.formularioLogin.get('Password')?.value;
                      if(passwordText?.toLowerCase() === password.toLowerCase()){
                        this.toastr.success('Bienvenido', '', {
                        timeOut:2500
                        });  
                        this.goColaTrabajo();
                      }else{
                        this.matSnackBar.open("Contraseña Incorrecta", "Cerrar",
                        {horizontalPosition:'center', verticalPosition:'top', duration: 1500}
                        );
                        return;
                      }
                    }else{
                      this.toastr.error(response.message, 'Cerrar', {
                      timeOut:2500
                      });
                    }
                  }
                }
              })
            }else{
              this.matSnackBar.open("Necesita accesos", "Cerrar",
              {horizontalPosition:'center', verticalPosition:'top', duration: 1500}
              );
              return;
            }
            
          }else{
            this.toastr.error(response.message, 'Cerrar', {
                timeOut:2500
              });
          }
        }
      }
    })
    }
  }


}
