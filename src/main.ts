import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import 'moment/locale/es';
// if (environment.production) {
//   enableProdMode();

//   platformBrowserDynamic().bootstrapModule(AppModule)
//     .then(() => {
//       if ('serviceWorker' in navigator) {
//         navigator.serviceWorker.register('ngsw-worker.js');
//       }
//     })
//     .catch(err => console.error(err));
// } else {
//   platformBrowserDynamic().bootstrapModule(AppModule)
//     .catch(err => console.error(err));
// }

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));

// Registro del Service Worker (solo en producción)
if (environment.production && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('ngsw-worker.js')
    .then(reg => console.log('Service Worker registrado', reg))
    .catch(err => console.error('Error al registrar SW', err));
}
