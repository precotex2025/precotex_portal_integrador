import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders, HttpParams } from '@angular/common/http';
import { GlobalVariable } from '../../VarGlobals';
import * as _moment from 'moment';
import { param } from 'jquery';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class LoginService {

  baseUrlTinto = GlobalVariable.baseUrlProcesoTenido;
  Header = new HttpHeaders({
    'Content-type': 'application/json'
  });

  constructor( private http: HttpClient) { }

  getUsuarioHabilitado(Cod_Usuario: string){
    const headers = this.Header;
    let params = new HttpParams();
    params = params.append('Cod_Usuario', Cod_Usuario);
    return this.http.get(this.baseUrlTinto + 'TxLogin/getGetUsuarioHabilitado', {headers, params});
  }

  getUsuarioWeb(Cod_Usuario: string){
    const headers = this.Header;
    let params = new HttpParams();
    params = params.append('Cod_Usuario', Cod_Usuario);
    return this.http.get(this.baseUrlTinto + 'TxLogin/getGetUsuarioWeb', {headers, params});
  }

}
