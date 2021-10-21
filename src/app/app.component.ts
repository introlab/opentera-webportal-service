import {Component, OnDestroy, OnInit} from '@angular/core';
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

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Promo Santé';
  loading: boolean;
  private subscription: Subscription;
  private websocketSub: Subscription;

  constructor(private cookieService: CookieService,
              private authService: AuthenticationService,
              private accountService: AccountService,
              private webSocketService: WebsocketService,
              private selectedSourceService: SelectedSourceService,
              private router: Router) {
  }

  ngOnInit(): void {
    this.router.events.pipe(delay(0)).subscribe((e) => {
      if (e instanceof RouterEvent) {
        this.navigationInterceptor(e);
      }
    });

    this.websocketSub = this.webSocketService.websocketData.subscribe(data => this.webSocketMessage(data));
    // this.refreshToken();
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

  // Process websocket events
  webSocketMessage(msg_data: any): void {

    const msgType = msg_data['@type'];

    if (msgType === 'type.googleapis.com/opentera.protobuf.JoinSessionEvent'){
      console.log('Join session event');
      const fullname = this.accountService.getAccount().fullname;
      const current_session_url = msg_data.sessionUrl + '&name=' + fullname;
      this.selectedSourceService.setSelectedSource(current_session_url);
      this.router.navigate([Pages.createPath(Pages.appPage)]);
    }

  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.websocketSub.unsubscribe();
  }
}
