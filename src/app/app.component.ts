import {Component, OnInit} from '@angular/core';
import {CookieService} from 'ngx-cookie-service';
import {AuthenticationService} from '@services/authentication.service';
import {GlobalConstants} from '@core/utils/global-constants';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(private cookieService: CookieService,
              private authService: AuthenticationService) {
  }

  ngOnInit(): void {
    if (!!this.cookieService.get(GlobalConstants.cookieValue)) {
      this.authService.startRefreshTokenTimer();
    }
  }
}
