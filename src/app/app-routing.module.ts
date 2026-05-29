import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { LoginComponent } from './Login/login/login.component';
import { LabColTrabajoComponent } from './lab-col-trabajo/lab-col-trabajo/lab-col-trabajo.component';
import { LabHojaFormulacionComponent } from './lab-hoja-formulacion/lab-hoja-formulacion.component';
import { LabDispAutolabComponent } from './lab-disp-autolab/lab-disp-autolab.component';
import { LabDosificacionComponent } from './lab-dosificacion/lab-dosificacion.component';
import { DialogAgregarPhComponent } from './lab-dosificacion/dialog-agregar-ph/dialog-agregar-ph.component';
import { DialogJabonadosComponent } from './dialog-jabonados/dialog-jabonados.component';
import { DialogAgregarOpcionComponent } from './lab-hoja-formulacion/dialog-agregar-opcion/dialog-agregar-opcion.component';
import { MantenimientosLstComponent } from './mantenimientos/mantenimientos-lst/mantenimientos-lst.component';
import { LabReportComponent } from './lab-report/lab-report.component';
import { DetalleJabFijComponent } from './mantenimientos/mantenimientos-lst/detalle-jab-fij/detalle-jab-fij.component';
import { DetalleCompExtraComponent } from './mantenimientos/mantenimientos-lst/detalle-comp-extra/detalle-comp-extra.component';
import { DialogNuevoCompExtraComponent } from './mantenimientos/mantenimientos-lst/detalle-comp-extra/dialog-nuevo-comp-extra/dialog-nuevo-comp-extra.component';
import { LabAnalisisDeltaComponent } from './lab-analisis-delta/lab-analisis-delta.component';
import { AccessGuard } from './guard/access.guard';

const routes: Routes = [
  // { path: '', redirectTo: 'Login', pathMatch: 'full' },
  // { path: 'Login', component: LoginComponent },
  // { path: 'ColaTrabajo', component: LabColTrabajoComponent }
  { path: 'Login', component: LoginComponent },
  { path: 'ColaTrabajo', component: LabColTrabajoComponent, canActivate: [AccessGuard] },
  { path: 'HojaFormulacion', component: LabHojaFormulacionComponent, canActivate: [AccessGuard] },
  { path: 'AgregarOpcion', component: DialogAgregarOpcionComponent, canActivate: [AccessGuard] },
  { path: 'DispensadoAutolab', component: LabDispAutolabComponent, canActivate: [AccessGuard] },
  { path: 'Dosificacion', component:LabDosificacionComponent, canActivate: [AccessGuard] },
  { path: 'AgregarPh', component: DialogAgregarPhComponent, canActivate: [AccessGuard] },
  { path: 'Jabonados', component: DialogJabonadosComponent, canActivate: [AccessGuard] },
  { path: 'Mantenimientos', component: MantenimientosLstComponent, canActivate: [AccessGuard] },
  { path: 'DetalleJabFij', component: DetalleJabFijComponent, canActivate: [AccessGuard] },
  { path: 'DetalleCompExtra', component: DetalleCompExtraComponent, canActivate: [AccessGuard] },
  { path: 'NuevoCompExtra', component: DialogNuevoCompExtraComponent, canActivate: [AccessGuard] },
  { path: 'Reporte', component: LabReportComponent },
  { path: 'AnalisisDelta', component: LabAnalisisDeltaComponent, canActivate: [AccessGuard] },
  
  { path: '**', redirectTo: 'Login' }
];


// const routes: Routes = [
//   { path: 'Login', component: LoginComponent },
//   {
//     path: 'Laboratorio',
//     component: LaboratorioTabsComponent,
//     children: [
//       { path: 'ColaTrabajo', component: LabColTrabajoComponent },
//       { path: 'HojaFormulacion', component: LabHojaFormulacionComponent },
//       { path: 'DispensadoAutolab', component: LabDispAutolabComponent },
//       { path: 'Jabonados', component: DialogJabonadosComponent },
//       { path: '', redirectTo: 'ColaTrabajo', pathMatch: 'full' }
//     ]
//   },
//   { path: 'Dosificacion', component: LabDosificacionComponent },
//   { path: 'AgregarPh', component: DialogAgregarPhComponent },
//   { path: '**', redirectTo: 'Login' }
// ];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
