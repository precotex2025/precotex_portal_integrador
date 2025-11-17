import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NavigationEnd } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'precotex_portal_integrador';

  isLoginRoute = true;

  constructor(
    private router: Router,
    public SpinnerService: NgxSpinnerService) {
    this.router.events.subscribe(event => {
    if (event instanceof NavigationEnd) {
      const currentRoute = event.urlAfterRedirects.toLowerCase();
      this.isLoginRoute = currentRoute === '/login';
    }
    });
  }

}
