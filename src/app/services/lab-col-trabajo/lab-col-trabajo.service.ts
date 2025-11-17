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

  getListarColorantesAgregarOpcion(){
    const headers = this.Header;
    return this.http.get(this.baseUrlTinto + 'LbColaTrabajo/getListarColorantesAgregarOpcion', { headers })
  }

  getListarJabonados(){
    const headers = this.Header;
    return this.http.get(this.baseUrlTinto + 'LbColaTrabajo/getListarJabonados', { headers })
  }

  getListarJabonadosCalculado(Colorante_Total: number, Familia: string){
    const headers = this.Header;
    let params = new HttpParams();
    params = params.append('Colorante_Total', Colorante_Total);
    params = params.append('Familia', Familia);
    return this.http.get(this.baseUrlTinto + 'LbColaTrabajo/getListarJabonadosCalculado', { headers, params })
  }

  getListarFijados(){
    const headers = this.Header;
    return this.http.get(this.baseUrlTinto + 'LbColaTrabajo/getListarFijados', { headers })
  }

  getListarFijadosCalculado(Colorante_Total: number, Familia: string){
    const headers = this.Header;
    let params = new HttpParams();
    params = params.append('Colorante_Total', Colorante_Total);
    params = params.append('Familia', Familia);
    return this.http.get(this.baseUrlTinto + 'LbColaTrabajo/getListarFijadosCalculado', { headers, params })
  }

  getListarCarbonatoSodaCalculado(Colorante_Total: number, Familia: string, Com_Cod_Con: number){
    const headers = this.Header;
    let params = new HttpParams();
    params = params.append('Colorante_Total', Colorante_Total);
    params = params.append('Familia', Familia);
    params = params.append('Com_Cod_Con', Com_Cod_Con);
    return this.http.get(this.baseUrlTinto + 'LbColaTrabajo/getListarCarbonatoSodaCalculado', { headers, params })
  }

  getListarColaAutolab(){
    const headers = this.Header;
    return this.http.get(this.baseUrlTinto + 'LbColaTrabajo/getListarColaAutolab', { headers })
  }

  getListarDispensado(){
    const headers = this.Header;
    return this.http.get(this.baseUrlTinto + 'LbColaTrabajo/getListarDispensado', { headers })
  }

  getListaAhibas(){
    const headers = this.Header;
    return this.http.get(this.baseUrlTinto + 'LbColaTrabajo/getListaAhibas', { headers })
  }

  getListarItemsEnAhiba(Ahi_Id: number){
    const headers = this.Header;
    let params = new HttpParams();
    params = params.append('Ahi_Id', Ahi_Id);
    return this.http.get(this.baseUrlTinto + 'LbColaTrabajo/getListarItemsEnAhiba', { headers, params })
  }

  getListarJabonado(){
    const headers = this.Header;
    return this.http.get(this.baseUrlTinto + 'LbColaTrabajo/getListarJabonado', { headers })
  }
  
  getListarFamiliasProceso(){
    const headers = this.Header;
    return this.http.get(this.baseUrlTinto + 'LbColaTrabajo/getListarFamiliasProceso', { headers })
  }

  getCargarColoranteParaCopiar(Corr_Carta: number, Sec: number, Correlativo: number){
    const headers = this.Header;
    let params = new HttpParams();
    params = params.append('Corr_Carta', Corr_Carta);
    params = params.append('Sec', Sec);
    params = params.append('Correlativo', Correlativo);
    return this.http.get(this.baseUrlTinto + 'LbColaTrabajo/getCargarColoranteParaCopiar', { headers, params })
  }
  
  getCargarColoranteParaDetalle(Corr_Carta: number, Sec: number, Correlativo: number){
    const headers = this.Header;
    let params = new HttpParams();
    params = params.append('Corr_Carta', Corr_Carta);
    params = params.append('Sec', Sec);
    params = params.append('Correlativo', Correlativo);
    return this.http.get(this.baseUrlTinto + 'LbColaTrabajo/getCargarColoranteParaDetalle', { headers, params })
  }

  postRegistrarDetalleColorSDC(data: any){
    const headers = this.Header;
    return this.http.post(this.baseUrlTinto + 'LbColaTrabajo/postRegistrarDetalleColorSDC', data, { headers })
  }

  postAgregarOpcionColorante(data: any){
    const headers = this.Header;
    return this.http.post(this.baseUrlTinto + 'LbColaTrabajo/postAgregarOpcionColorante', data, { headers })
  }

  postCopiarOpcionColorante(data: any){
    const headers = this.Header;
    return this.http.post(this.baseUrlTinto + 'LbColaTrabajo/postCopiarOpcionColorante', data, { headers })
  }

  postAgregarAuxiliaresHojaFormulacion(data: any){
    const headers = this.Header;
    return this.http.post(this.baseUrlTinto + 'LbColaTrabajo/postAgregarAuxiliaresHojaFormulacion', data, { headers })
  }

  postLlenarTextoFinal(data: any){
    const headers = this.Header;
    return this.http.post(this.baseUrlTinto + 'LbColaTrabajo/postLlenarTextoFinal', data, { headers })
  }

  patchActualizarEstadoDeColor(data: any){
    const headers = this.Header;
    return this.http.patch(this.baseUrlTinto + 'LbColaTrabajo/patchActualizarEstadoDeColor', data, { headers })
  }

  patchActualizarEstadoDeColorTricomia(data: any){
    const headers = this.Header;
    return this.http.patch(this.baseUrlTinto + 'LbColaTrabajo/patchActualizarEstadoDeColorTricomia', data, { headers })
  }

  patchActualizarEstadoDeColorTricomiaAutolab(data: any){
    const headers = this.Header;
    return this.http.patch(this.baseUrlTinto + 'LbColaTrabajo/patchActualizarEstadoDeColorTricomiaAutolab', data, { headers })
  }

  patchEnviarADispensado(data: any){
    const headers = this.Header;
    return this.http.patch(this.baseUrlTinto + 'LbColaTrabajo/patchEnviarADispensado', data, { headers })
  }

  patchCargarAahiba(data: any){
    const headers = this.Header;
    return this.http.patch(this.baseUrlTinto + 'LbColaTrabajo/patchCargarAahiba', data, { headers })
  }

  patchActualizarPH(data: any){
    const headers = this.Header;
    return this.http.patch(this.baseUrlTinto + 'LbColaTrabajo/patchActualizarPH', data, { headers })
  }

  patchEnviarAutolab(data: any){
    const headers = this.Header;
    return this.http.patch(this.baseUrlTinto + 'LbColaTrabajo/patchEnviarAutolab', data, { headers })
  }

  deleteEliminarOpcionColorante(Corr_Carta: number, Sec: number, Correlativo: number) {
    const headers = this.Header;
    let params = new HttpParams();
    params = params.append('Corr_Carta', Corr_Carta);
    params = params.append('Sec', Sec);
    params = params.append('Correlativo', Correlativo);
    return this.http.delete(this.baseUrlTinto + 'LbColaTrabajo/deleteEliminarOpcionColorante', { headers, params })
  }
}
