import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';

import { AppModule } from './app.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './Login/login/login.component';

@NgModule({
  imports: [
    AppModule,
    ServerModule,
  ],
  //bootstrap:[AppComponent] <-- SE CAMBIO POR EL LOGIN COMPONENT
  //bootsrap:[AppLogin] <-- REGRESAMOS DEL APPLOGIN AL COMPONENT
  bootstrap: [AppComponent],
})
export class AppServerModule {}
