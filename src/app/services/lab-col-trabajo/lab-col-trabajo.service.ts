import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders, HttpParams } from '@angular/common/http';
import { GlobalVariable } from '../../VarGlobals';
import * as _moment from 'moment';
import { param } from 'jquery';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LabColTrabajoService {
  baseUrlTinto = GlobalVariable.baseUrlProcesoTenido;
  Header = new HttpHeaders({
    'Content-type': 'application/json'
  });
  constructor(private http: HttpClient) { }

  getListaSDCPorEstado(){
    const headers = this.Header;
    return this.http.get(this.baseUrlTinto + 'LbColaTrabajo/getListaSDCPorEstado', {headers});
  }

}
