import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders, HttpParams } from '@angular/common/http';
import { GlobalVariable } from '../../VarGlobals';
import _moment from 'moment';
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

  getListaSDCPorEstado(estadoSeleccionado: string, Fec_Ini: any, Fec_Fin: any){

    if(!_moment(Fec_Ini).isValid())
    { Fec_Ini = ''; }
    else
    { Fec_Ini = _moment(Fec_Ini.valueOf()).format('MM/DD/YYYY'); }

    if(!_moment(Fec_Fin).isValid())
    { Fec_Fin = ''; }
    else
    { Fec_Fin = _moment(Fec_Fin.valueOf()).format('MM/DD/YYYY'); }


    const headers = this.Header;
    let params = new HttpParams();
    params = params.append('Flg_Est_Lab', estadoSeleccionado);
    params = params.append('Fec_Ini', Fec_Ini);
    params = params.append('Fec_Fin', Fec_Fin);
    return this.http.get(this.baseUrlTinto + 'LbColaTrabajo/getListaSDCPorEstado', {headers, params})
  }

  getListaSDCDetalle(Corr_Carta: any){
    const headers = this.Header;
    let params = new HttpParams();
    params = params.append('Corr_Carta', Corr_Carta)
    return this.http.get(this.baseUrlTinto + 'LbColaTrabajo/getListaSDCDetalle', { headers, params })
  }

  getLlenarDesplegable(){
    const headers = this.Header;
    return this.http.get(this.baseUrlTinto + 'LbColaTrabajo/getLlenarDesplegable', { headers })
  }

  getLlenarGrillaDesplegable(Corr_Carta: number, Sec: number){
    const headers = this.Header;
    let params = new HttpParams();
    params = params.append('Corr_Carta', Corr_Carta);
    params = params.append('Sec', Sec);
    return this.http.get(this.baseUrlTinto + 'LbColaTrabajo/getLlenarGrillaDesplegable', { headers, params })
  }

  getCargarComboBoxItem(){
    const headers = this.Header;
    return this.http.get(this.baseUrlTinto + 'LbColaTrabajo/getCargarComboBoxItem', { headers })
  }

  getCargarInformeSDC(Corr_Carta: number, Sec: number){
    const headers = this.Header;
    let params = new HttpParams();
    params = params.append('Corr_Carta', Corr_Carta);
    params = params.append('Sec', Sec);
    return this.http.get(this.baseUrlTinto + 'LbColaTrabajo/getCargarInformeSDC', { headers, params })
  }

  getCargarGridHojaFormulacion(Corr_Carta: number, Sec: number){
    const headers = this.Header;
    let params = new HttpParams();
    params = params.append('Corr_Carta', Corr_Carta);
    params = params.append('Sec', Sec);
    return this.http.get(this.baseUrlTinto + 'LbColaTrabajo/getCargarGridHojaFormulacion', { headers, params })
  }

  postRegistrarDetalleColorSDC(data: any){
    const headers = this.Header;
    return this.http.post(this.baseUrlTinto + 'LbColaTrabajo/postRegistrarDetalleColorSDC', data, { headers })
  }

  postAgregarOpcionColorante(data: any){
    const headers = this.Header;
    return this.http.post(this.baseUrlTinto + 'LbColaTrabajo/postAgregarOpcionColorante', data, { headers })
  }

  patchActualizarEstadoDeColor(data: any){
    const headers = this.Header;
    return this.http.patch(this.baseUrlTinto + 'LbColaTrabajo/patchActualizarEstadoDeColor', data, { headers })
  }



}
