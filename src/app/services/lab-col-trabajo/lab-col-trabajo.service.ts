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

  getListaSDCPorEstado(estadoSeleccionado: string, Fec_Ini: any, Fec_Fin: any, usuario: string){

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
    params = params.append('Usr_Cod', usuario);
    return this.http.get(this.baseUrlTinto + 'LbColaTrabajo/getListaSDCPorEstado', {headers, params})
  }

  getListaSDCDetalle(Corr_Carta: any){
    const headers = this.Header;
    let params = new HttpParams();
    params = params.append('Corr_Carta', Corr_Carta)
    return this.http.get(this.baseUrlTinto + 'LbColaTrabajo/getListaSDCDetalle', { headers, params })
  }

  getLlenarDesplegable(Usr_Cod: string){
    const headers = this.Header;
    let params = new HttpParams();
    params = params.append('Usr_Cod', Usr_Cod);
    return this.http.get(this.baseUrlTinto + 'LbColaTrabajo/getLlenarDesplegable', { headers, params })
  }

  getLlenarDesplegableProduccion(Usr_Cod: string){
    const headers = this.Header;
    let params = new HttpParams();
    params = params.append('Usr_Cod', Usr_Cod);
    return this.http.get(this.baseUrlTinto + 'LbColaTrabajo/getLlenarDesplegableProduccion', { headers, params })
  }

  getLlenarGrillaDesplegable(Corr_Carta: any, Sec: number){
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

  getCargarInformeSDC(Corr_Carta: any, Sec: number){
    const headers = this.Header;
    let params = new HttpParams();
    params = params.append('Corr_Carta', Corr_Carta);
    params = params.append('Sec', Sec);
    return this.http.get(this.baseUrlTinto + 'LbColaTrabajo/getCargarInformeSDC', { headers, params })
  }

  getCargarGridHojaFormulacion(Corr_Carta: any, Sec: number){
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

  getListarColaAutolab(Usr_Cod: string){
    const headers = this.Header;
    let params = new HttpParams();
    params = params.append('Usr_Cod', Usr_Cod);
    return this.http.get(this.baseUrlTinto + 'LbColaTrabajo/getListarColaAutolab', { headers, params })
  }

  getListarDispensado(Usr_Cod: string){
    const headers = this.Header;
    let params = new HttpParams();
    params = params.append('Usr_Cod', Usr_Cod);
    return this.http.get(this.baseUrlTinto + 'LbColaTrabajo/getListarDispensado', { headers, params })
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

  getListarJabonado(Usr_Cod: string){
    const headers = this.Header;
    let params = new HttpParams();
    params = params.append('Usr_Cod', Usr_Cod);
    return this.http.get(this.baseUrlTinto + 'LbColaTrabajo/getListarJabonado', { headers, params })
  }
  
  getListarFamiliasProceso(){
    const headers = this.Header;
    return this.http.get(this.baseUrlTinto + 'LbColaTrabajo/getListarFamiliasProceso', { headers })
  }

  getCargarColoranteParaCopiar(Corr_Carta: any, Sec: number, Correlativo: number){
    const headers = this.Header;
    let params = new HttpParams();
    params = params.append('Corr_Carta', Corr_Carta);
    params = params.append('Sec', Sec);
    params = params.append('Correlativo', Correlativo);
    return this.http.get(this.baseUrlTinto + 'LbColaTrabajo/getCargarColoranteParaCopiar', { headers, params })
  }
  
  getCargarColoranteParaDetalle(Corr_Carta: any, Sec: number, Correlativo: number){
    const headers = this.Header;
    let params = new HttpParams();
    params = params.append('Corr_Carta', Corr_Carta);
    params = params.append('Sec', Sec);
    params = params.append('Correlativo', Correlativo);
    return this.http.get(this.baseUrlTinto + 'LbColaTrabajo/getCargarColoranteParaDetalle', { headers, params })
  }

  getListarIngresoManual(Corr_Carta: any, Sec: number, Correlativo: number){
    const headers = this.Header;
    let params = new HttpParams();
    params = params.append('Corr_Carta', Corr_Carta);
    params = params.append('Sec', Sec);
    params = params.append('Correlativo', Correlativo);
    return this.http.get(this.baseUrlTinto + 'LbColaTrabajo/getListarIngresoManual', { headers, params })
  }

  getCargarDatosReporte(Corr_Carta: any, Sec: number, Correlativo: number){
    const headers = this.Header;
    let params = new HttpParams();
    params = params.append('Corr_Carta', Corr_Carta);
    params = params.append('Sec', Sec);
    params = params.append('Correlativo', Correlativo);
    return this.http.get(this.baseUrlTinto + 'LbColaTrabajo/getCargarDatosReporte', { headers, params })
  }

  getListarJabonadoMantenimiento() {
    const headers = this.Header;
    return this.http.get(this.baseUrlTinto + 'LbColaTrabajo/getListarJabonadoMantenimiento', { headers })
  }

  getListarJabonadosDetalleMantenimiento(Jab_Id: number){
    const headers = this.Header;
    let params = new HttpParams();
    params = params.append('Jab_Id', Jab_Id)
    return this.http.get(this.baseUrlTinto + 'LbColaTrabajo/getListarJabonadosDetalleMantenimiento', { headers, params })
  }

  getListarFijadosMantenimiento() {
    const headers = this.Header;
    return this.http.get(this.baseUrlTinto + 'LbColaTrabajo/getListarFijadosMantenimiento', { headers })
  }

  getListarFijadosDetalleMantenimiento(Fij_Id: number){
    const headers = this.Header;
    let params = new HttpParams();
    params = params.append('Fij_Id', Fij_Id);
    return this.http.get(this.baseUrlTinto + 'LbColaTrabajo/getListarFijadosDetalleMantenimiento', { headers, params })
  }

  getListarProcesoValor(Pro_Cod: string) {
    const headers = this.Header;
    let params = new HttpParams();
    params = params.append('Pro_Cod', Pro_Cod);
    return this.http.get(this.baseUrlTinto + 'LbColaTrabajo/getListarProcesoValor', { headers, params })
  }

  getListarCurvas(Pro_Cod: string) {
    const headers = this.Header;
    let params = new HttpParams();
    params = params.append('Pro_Cod', Pro_Cod);
    return this.http.get(this.baseUrlTinto + 'LbColatrabajo/getListarCurvas', { headers, params })
  }
  
  getListarJabonadoExcluido(Usr_Cod: string) {
    const headers = this.Header;
    let params = new HttpParams();
    params = params.append('Usr_Cod', Usr_Cod);
    return this.http.get(this.baseUrlTinto + 'LbColatrabajo/getListarJabonadoExcluido', { headers, params })
  }

  getObtenerTrio(Corr_Carta: any, Sec: number) {
    const headers = this.Header;
    let params = new HttpParams();
    params = params.append('Corr_Carta', Corr_Carta);
    params = params.append('Sec', Sec);
    return this.http.get(this.baseUrlTinto + 'LbColaTrabajo/getObtenerTrio', { headers, params })
  }

  getObtenerDatosProduccion(estadoSeleccionado: string, Fec_Ini: any, Fec_Fin: any, usuario: string){
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
    params = params.append('Usr_Cod', usuario);
    return this.http.get(this.baseUrlTinto + 'LbColaTrabajo/getObtenerDatosProduccion', { headers, params })
  }

  getObtenerUltimoCorrelativo(Corr_Carta: any, Sec: number) {
    const headers = this.Header;
    let params = new HttpParams();
    params = params.append('Corr_Carta', Corr_Carta);
    params = params.append('Sec', Sec);
    return this.http.get(this.baseUrlTinto + 'LbColaTrabajo/getObtenerUltimoCorrelativo', { headers, params })
  }

  getObtenerPartidasAgrupadas(Usr_Cod: string, Corr_Carta: any){
    const headers = this.Header;
    let params = new HttpParams();
    params = params.append('Usr_Cod', Usr_Cod);
    params = params.append('Corr_Carta', Corr_Carta);
    return this.http.get(this.baseUrlTinto + 'LbColaTrabajo/getObtenerPartidasAgrupadas', { headers, params })
  }

  getObtenerFamiliaDesdeCabecera(Corr_Carta: string, Sec: number){
    const headers = this.Header;
    let params = new HttpParams();
    params = params.append('Corr_Carta', Corr_Carta);
    params = params.append('Sec', Sec);
    return this.http.get(this.baseUrlTinto + 'LbColaTrabajo/getObtenerFamiliaDesdeCabecera', { headers, params })
  }

  getGetUsuarioWeb(Cod_Usuario: string | null){
    const headers = this.Header;
    let params = new HttpParams();
    params = params.append('Cod_Usuario', Cod_Usuario!);
    return this.http.get(this.baseUrlTinto + 'LbColaTrabajo/getGetUsuarioWeb', { headers, params })
  }

  getObtenerFijadosTipo(){
    const headers = this.Header;
    return this.http.get(this.baseUrlTinto + 'LbColaTrabajo/getObtenerFijadosTipo', { headers })
  }

  getListarJabonadoExcluidoDescarga(Usr_Cod: string){
    const headers = this.Header;
    let params = new HttpParams();
    params = params.append('Usr_Cod', Usr_Cod);
    return this.http.get(this.baseUrlTinto + 'LbColaTrabajo/getListarJabonadoExcluidoDescarga', { headers, params })
  }

  getListarPrevios(){
    const headers = this.Header;
    return this.http.get(this.baseUrlTinto + 'LbColaTrabajo/getListarPrevios', { headers })
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

  postRegistrarJabonado(data: any){
    const headers = this.Header;
    return this.http.post(this.baseUrlTinto + 'LbColaTrabajo/postRegistrarJabonado', data, { headers })
  }
  
  postRegistrarFijado(data: any){
    const headers = this.Header;
    return this.http.post(this.baseUrlTinto + 'LbColaTrabajo/postRegistrarFijado', data, { headers })
  }

  postRegistrarJabonadoDetalle(data: any){
    const headers = this.Header;
    return this.http.post(this.baseUrlTinto + 'LbColaTrabajo/postRegistrarJabonadoDetalle', data, { headers })
  }

  postRegistrarFijadoDetalle(data: any){
    const headers = this.Header;
    return this.http.post(this.baseUrlTinto + 'LbColaTrabajo/postRegistrarFijadoDetalle', data, { headers })
  }

  postRegistrarProceso(data: any){
    const headers = this.Header;
    return this.http.post(this.baseUrlTinto+ 'LbColaTrabajo/postRegistrarProceso', data, { headers })
  }

  postRegistrarProcesoValor(data: any){
    const headers = this.Header;
    return this.http.post(this.baseUrlTinto + 'LbColaTrabajo/postRegistrarProcesoValor', data, { headers })
  }

  postAgregarOpcionAjustada(data: any){
    const headers = this.Header;
    return this.http.post(this.baseUrlTinto + 'LbColaTrabajo/postAgregarOpcionAjustada', data, { headers })
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

  patchModificarJabonado(data: any){
    const headers = this.Header;
    return this.http.patch(this.baseUrlTinto + 'LbColaTrabajo/patchModificarJabonado', data, { headers })
  }

  patchModificarFijado(data: any){
    const headers = this.Header;
    return this.http.patch(this.baseUrlTinto + 'LbColaTrabajo/patchModificarFijado', data, { headers })
  }

  patchDeshabilitarJabonado(data: any){
    const headers = this.Header;
    return this.http.patch(this.baseUrlTinto + 'LbColaTrabajo/patchDeshabilitarJabonado', data, { headers })
  }

  patchDeshabilitarFijado(data: any){
    const headers = this.Header;
    return this.http.patch(this.baseUrlTinto + 'LbColaTrabajo/patchDeshabilitarFijado', data, { headers })
  }

  patchModificarJabonadoDetalle(data: any){
    const headers = this.Header;
    return this.http.patch(this.baseUrlTinto + 'LbColaTrabajo/patchModificarJabonadoDetalle', data, { headers })
  }

  patchModificarFijadoDetalle(data: any){
    const headers = this.Header;
    return this.http.patch(this.baseUrlTinto + 'LbColaTrabajo/patchModificarFijadoDetalle', data, { headers })
  }

  patchDeshabilitarJabonadoDetalle(data: any){
    const headers = this.Header;
    return this.http.patch(this.baseUrlTinto + 'LbColaTrabajo/patchDeshabilitarJabonadoDetalle', data, { headers })
  }

  patchDeshabilitarFijadoDetalle(data: any){
    const headers = this.Header;
    return this.http.patch(this.baseUrlTinto + 'LbColaTrabajo/patchDeshabilitarFijadoDetalle', data, { headers })
  }

  patchModificarProceso(data: any){
    const headers = this.Header;
    return this.http.patch(this.baseUrlTinto + 'LbColaTrabajo/patchModificarProceso', data, { headers })
  }

  patchDeshabilitarProceso(data: any){
    const headers = this.Header;
    return this.http.patch(this.baseUrlTinto + 'LbColaTrabajo/patchDeshabilitarProceso', data, { headers })
  }

  patchModificarProcesoValor(data: any){
    const headers = this.Header;
    return this.http.patch(this.baseUrlTinto + 'LbColaTrabajo/patchModificarProcesoValor', data, { headers })
  }

  patchDeshabilitarProcesoValor(data: any){
    const headers = this.Header;
    return this.http.patch(this.baseUrlTinto + 'LbColaTrabajo/patchDeshabilitarProcesoValor', data, { headers })
  }

  patchProcesoAhiba(data: any){
    const headers = this.Header;
    return this.http.patch(this.baseUrlTinto + 'LbColaTrabajo/patchProcesoAhiba', data, { headers })
  }

  patchReformularPartida(data: any){
    const headers = this.Header;
    return this.http.patch(this.baseUrlTinto + 'LbColaTrabajo/padtchReformularPartida', data, { headers })
  }

  patchActualizarEstadoEntregaProduccion(data: any){
    const headers = this.Header;
    return this.http.patch(this.baseUrlTinto + 'LbColaTrabajo/patchActualizarEstadoEntregaProduccion', data, { headers })
  }

  patchActualizarFechasTenido(data: any){
    const headers = this.Header;
    return this.http.patch(this.baseUrlTinto + 'LbColaTrabajo/patchActualizarFechasTenido', data, { headers })
  }

  patchActualizarFijadoTipo(data: any){
    const headers = this.Header;
    return this.http.patch(this.baseUrlTinto + 'LbColaTrabajo/patchActualizarFijadoTipo', data, { headers })
  }

  patchActualizarEstadoCargaAhiba(data: any){
    const headers = this.Header;
    return this.http.patch(this.baseUrlTinto + 'LbColaTrabajo/patchActualizarEstadoCargaAhiba', data, { headers })
  }

  patchActualizarPrevio(data: any){
    const headers = this.Header;
    return this.http.patch(this.baseUrlTinto + 'LbColaTrabajo/patchActualizarPrevio', data, { headers })
  }

  deleteEliminarOpcionColorante(Corr_Carta: any, Sec: number, Correlativo: number) {
    const headers = this.Header;
    let params = new HttpParams();
    params = params.append('Corr_Carta', Corr_Carta);
    params = params.append('Sec', Sec);
    params = params.append('Correlativo', Correlativo);
    return this.http.delete(this.baseUrlTinto + 'LbColaTrabajo/deleteEliminarOpcionColorante', { headers, params })
  }

  enviarPDF(formData: FormData): Observable<any> {
    const headers = this.Header.delete('Content-type');
    return this.http.post(this.baseUrlTinto + 'LbColaTrabajo/print', formData, { headers });
  }
}
