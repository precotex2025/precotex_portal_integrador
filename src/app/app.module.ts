import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePipe, HashLocationStrategy, LocationStrategy } from '@angular/common';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSortModule } from '@angular/material/sort';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideNativeDateAdapter } from '@angular/material/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './Login/login/login.component';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'
import { HttpErrorInterceptor } from './interceptors/http-error-response.service';  

import { MaterialModule } from './material.module';
import { ToastrModule } from 'ngx-toastr';
//import { FilterByValuePipe } from './pipes/filter-by-value.pipe';

import { MY_DATE_FORMATS } from '../app/my-date-formats';

/*DECLARAR MODULOS*/
import { LabColTrabajoComponent } from './lab-col-trabajo/lab-col-trabajo/lab-col-trabajo.component';




@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    LabColTrabajoComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
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
    ToastrModule.forRoot({
      timeOut: 10000,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true

    }),
  ],
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    { provide: LocationStrategy, useClass: HashLocationStrategy},
    { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true},
    DatePipe,
    provideClientHydration(),
    provideAnimationsAsync(),
    provideNativeDateAdapter(),
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
