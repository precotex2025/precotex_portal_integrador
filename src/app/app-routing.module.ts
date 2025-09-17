import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { LoginComponent } from './Login/login/login.component';
import { LabColTrabajoComponent } from './lab-col-trabajo/lab-col-trabajo/lab-col-trabajo.component';
const routes: Routes = [
  { path: "root", component: AppComponent },
  { path: "Login", component: LoginComponent },
  { path: 'ColaTrabajo', component: LabColTrabajoComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
