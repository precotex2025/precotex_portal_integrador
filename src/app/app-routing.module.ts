import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { LoginComponent } from './Login/login/login.component';
import { LabColTrabajoComponent } from './lab-col-trabajo/lab-col-trabajo/lab-col-trabajo.component';
import { LabHojaFormulacionComponent } from './lab-hoja-formulacion/lab-hoja-formulacion.component';
const routes: Routes = [
  // { path: '', redirectTo: 'Login', pathMatch: 'full' },
  // { path: 'Login', component: LoginComponent },
  // { path: 'ColaTrabajo', component: LabColTrabajoComponent }
  { path: 'Login', component: LoginComponent},
  { path: 'ColaTrabajo', component: LabColTrabajoComponent },
  { path: 'HojaFormulacion', component: LabHojaFormulacionComponent},
  { path: '**', redirectTo: 'Login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
