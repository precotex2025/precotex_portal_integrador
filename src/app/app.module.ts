import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe, HashLocationStrategy, LocationStrategy } from '@angular/common';
import { MatDateFormats, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSortModule } from '@angular/material/sort';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatMomentDateModule, MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './Login/login/login.component';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'
import { HttpErrorInterceptor } from './interceptors/http-error-response.service';  

import { MaterialModule } from './material.module';
import { ToastrModule } from 'ngx-toastr';
//import { FilterByValuePipe } from './pipes/filter-by-value.pipe';
import { RouterModule } from '@angular/router';
import { MY_DATE_FORMATS } from '../app/my-date-formats';
import { getCustomPaginatorIntl } from './paginacion-custom';


/*DECLARAR MODULOS*/
import { LabColTrabajoComponent } from './lab-col-trabajo/lab-col-trabajo/lab-col-trabajo.component';
import { DialogLabColTrabajoDetalleComponent } from './lab-col-trabajo/lab-col-trabajo/dialog-lab-col-trabajo-detalle/dialog-lab-col-trabajo-detalle.component';
import { LabHojaFormulacionComponent } from './lab-hoja-formulacion/lab-hoja-formulacion.component';
import { LaboratorioTabsComponent } from './laboratorio-tabs/laboratorio-tabs.component';
import { MatTabsModule } from '@angular/material/tabs';
import { DialogAgregarOpcionComponent } from './lab-hoja-formulacion/dialog-agregar-opcion/dialog-agregar-opcion.component';
import { DialogInfoSdcComponent } from './lab-hoja-formulacion/dialog-info-sdc/dialog-info-sdc.component';
import { DialogDetalleColorComponent } from './lab-hoja-formulacion/dialog-detalle-color/dialog-detalle-color.component';
import { LabDispAutolabComponent } from './lab-disp-autolab/lab-disp-autolab.component';
import { LabDosificacionComponent } from './lab-dosificacion/lab-dosificacion.component';
import { DialogAgregarPhComponent } from './lab-dosificacion/dialog-agregar-ph/dialog-agregar-ph.component';
import { DialogJabonadosComponent } from './dialog-jabonados/dialog-jabonados.component';
import { NgxSpinner, NgxSpinnerModule } from 'ngx-spinner';
import { ServiceWorkerModule } from '@angular/service-worker';
import { LabReportComponent } from './lab-report/lab-report.component';
import { MantenimientosLstComponent } from './mantenimientos/mantenimientos-lst/mantenimientos-lst.component';
import { DetalleJabFijComponent } from './mantenimientos/mantenimientos-lst/detalle-jab-fij/detalle-jab-fij.component';
import { DetalleCompExtraComponent } from './mantenimientos/mantenimientos-lst/detalle-comp-extra/detalle-comp-extra.component';
import { DialogNuevoCompExtraComponent } from './mantenimientos/mantenimientos-lst/detalle-comp-extra/dialog-nuevo-comp-extra/dialog-nuevo-comp-extra.component';
import { DialogEntregaAjusteComponent } from './lab-hoja-formulacion/dialog-entrega-ajuste/dialog-entrega-ajuste.component';
import { LabAnalisisDeltaComponent } from './lab-analisis-delta/lab-analisis-delta.component';
import { NgChartsModule } from 'ng2-charts';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    LabColTrabajoComponent,
    LaboratorioTabsComponent,
    DialogLabColTrabajoDetalleComponent,
    LabHojaFormulacionComponent,
    DialogAgregarOpcionComponent,
    DialogInfoSdcComponent,
    DialogDetalleColorComponent,
    LabDispAutolabComponent,
    LabDosificacionComponent,
    DialogAgregarPhComponent,
    DialogJabonadosComponent,
    LabReportComponent,
    MantenimientosLstComponent,
    DetalleJabFijComponent,
    DetalleCompExtraComponent,
    DialogNuevoCompExtraComponent,
    DialogEntregaAjusteComponent,
    LabAnalisisDeltaComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule,
    CommonModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    BrowserModule,
    MatTableModule,
    MatTooltipModule,
    MatSortModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatTabsModule,
    MatPaginatorModule,
    NgxSpinnerModule,
    MatMomentDateModule,
    MatTooltipModule,
    NgChartsModule,   
    ToastrModule.forRoot({
      timeOut: 10000,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true
    }),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-Es' },
    { provide: LocationStrategy, useClass: HashLocationStrategy},
    { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true},
    { provide: MatPaginatorIntl, useValue: getCustomPaginatorIntl() },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS] },
    DatePipe,
    provideClientHydration(),
    provideAnimationsAsync(),
    provideNativeDateAdapter(),
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
