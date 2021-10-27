import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {CookieService} from 'ngx-cookie-service';
import {AuthenticationService} from '@services/authentication.service';
import {NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterEvent} from '@angular/router';
import {delay} from 'rxjs/operators';
import {AccountService} from '@services/account.service';
import {GlobalConstants} from '@core/utils/global-constants';
import {Subscription, throwError} from 'rxjs';
import {isUser} from '@core/utils/utility-functions';
import {WebsocketService} from '@services/websocket.service';
import {Pages} from '@core/utils/pages';
import {SelectedSourceService} from '@services/selected-source.service';
import {SessionManagerService} from '@services/session-manager.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Promo Santé';
  loading: boolean;
  private subscription: Subscription;

  constructor(private cookieService: CookieService,
              private authService: AuthenticationService,
              private accountService: AccountService,
              private webSocketService: WebsocketService,
              private selectedSourceService: SelectedSourceService,
              private router: Router,
              private sessionManagerService: SessionManagerService) {
  }

  ngOnInit(): void {
    this.router.events.pipe(delay(0)).subscribe((e) => {
      if (e instanceof RouterEvent) {
        this.navigationInterceptor(e);
      }
    });
  }

  private refreshToken(): void {
    this.subscription = this.accountService.account$().subscribe((account) => {
      if (isUser(account) && !!this.cookieService.get(GlobalConstants.cookieValue)) {
        this.authService.startRefreshTokenTimer();
      }
    });
  }

  // Shows and hides the loading spinner during RouterEvent changes
  navigationInterceptor(event: RouterEvent): void {
    if (event instanceof NavigationStart) {
      this.loading = true;
    } else if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
      this.loading = false;
    }
  }

  // Detects page leaving and/or browser refresh
  @HostListener('window:beforeunload', ['$event'])
  beforeUnload($event: any): void {
    $event.preventDefault();
    $event.returnValue = true;
    // console.log('Leaving site...');
    // this.authService.reset();
  }

  @HostListener('window:unload', ['$event'])
  onUnload($event: any): void {
    console.log('Leaving site...');
    this.authService.reset();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
