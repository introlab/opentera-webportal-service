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
import {DEFAULT_INTERRUPTSOURCES, Idle} from '@ng-idle/core';
import {Keepalive} from '@ng-idle/keepalive';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {InformationComponent} from '@components/information/information/information.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Portail Web';
  loading: boolean;
  private subscription: Subscription;
  private inactivityDialog: MatDialogRef<InformationComponent, any> = null;

  constructor(private cookieService: CookieService,
              private authService: AuthenticationService,
              private accountService: AccountService,
              private webSocketService: WebsocketService,
              private selectedSourceService: SelectedSourceService,
              private router: Router,
              private sessionManagerService: SessionManagerService,
              private idle: Idle,
              private keepalive: Keepalive,
              private dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.router.events.pipe(delay(0)).subscribe((e) => {
      if (e instanceof RouterEvent) {
        this.navigationInterceptor(e);
      }
    });
    this.initIdleTimeout();
  }

  private initIdleTimeout(): void {
    // sets an idle timeout of 2 hours
    this.idle.setIdle(60 * 60 * 2);
    // sets a timeout period of 60 seconds. After that delay, if no user input, it will be logged out.
    this.idle.setTimeout(60);
    // sets the default interrupts, in this case, things like clicks, scrolls, touches to the document
    this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

    this.idle.onIdleEnd.subscribe(() => {
      // console.log('No longer idle');
      this.resetIdleTimer();
    });

    this.idle.onTimeout.subscribe(() => {
      // console.log('Timed out!');
      this.inactivityDialog.close();
      this.authService.logout().subscribe();
    });

    this.idle.onIdleStart.subscribe(() => {
      // console.log('You\'ve gone idle!');
      this.idle.setInterrupts([]);
      if (this.inactivityDialog == null){
        this.inactivityDialog = this.dialog.open(InformationComponent, {
          width: '350px',
          data: {message: 'Idle', button_text: 'Ne pas me déconnecter'}
        });
        this.inactivityDialog.afterClosed().subscribe(() => {
          // console.log('Dialog deleted');
          this.resetIdleTimer();
          this.inactivityDialog = null;
        });
      }
    });

    this.idle.onTimeoutWarning.subscribe((countdown) => {
      const idleState = 'Vous serez automatiquement déconnectés dans ' + countdown + ' secondes...';
      this.inactivityDialog.componentInstance.data.message = idleState;
      // console.log(idleState);
    });

    // sets the ping interval to 15 seconds
    this.keepalive.interval(15);

    // this.keepalive.onPing.subscribe(() => this.lastPing = new Date());

    // this.resetIdleTimer();
    this.authService.loginStateChange().subscribe(userLoggedIn => {
      if (userLoggedIn) {
        this.resetIdleTimer();
      } else {
        this.stopIdleTimer();
      }
    });
  }

  private resetIdleTimer(): void{
    this.idle.stop();
    this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);
    this.idle.watch();
  }

  private stopIdleTimer(): void{
    this.idle.stop();
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
    if (this.authService.isAuthenticated() && isUser(this.accountService.getAccount())) {
      $event.preventDefault();
      $event.returnValue = true;
    }else{
      // $event.returnValue = false;
    }
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
