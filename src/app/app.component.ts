import {Component, OnInit} from '@angular/core';
import {CookieService} from 'ngx-cookie-service';
import {AuthenticationService} from '@services/authentication.service';
import {GlobalConstants} from '@core/utils/global-constants';
import {NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterEvent} from '@angular/router';
import {delay} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Promo Santé';
  loading: boolean;

  constructor(private cookieService: CookieService,
              private authService: AuthenticationService,
              private router: Router) {
  }

  ngOnInit(): void {
    this.router.events.pipe(delay(0)).subscribe((e) => {
      if (e instanceof RouterEvent) {
        this.navigationInterceptor(e);
      }
    });
    if (!!this.cookieService.get(GlobalConstants.cookieValue)) {
      this.authService.startRefreshTokenTimer();
    }
  }

  // Shows and hides the loading spinner during RouterEvent changes
  navigationInterceptor(event: RouterEvent): void {
    if (event instanceof NavigationStart) {
      this.loading = true;
    } else if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
      this.loading = false;
    }
  }
}
