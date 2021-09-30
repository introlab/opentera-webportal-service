import {Injectable} from '@angular/core';
import {Resolve, RouterStateSnapshot, ActivatedRouteSnapshot} from '@angular/router';
import {Observable, of, throwError} from 'rxjs';
import {AccountService} from '@services/account.service';
import {Account} from '@shared/models/account.model';
import {catchError, map, shareReplay, tap} from 'rxjs/operators';
import {CookieService} from 'ngx-cookie-service';
import {AuthenticationService} from '@services/authentication.service';
import {isUser} from '@core/utils/utility-functions';
import {GlobalConstants} from '@core/utils/global-constants';

@Injectable({
  providedIn: 'root'
})
export class AccountResolver implements Resolve<Account> {
  private account: Account = undefined;

  constructor(private accountService: AccountService,
              private authService: AuthenticationService,
              private cookieService: CookieService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Account> {
    return this.getAccountFromAPI();
  }

  private getSavedAccount(): Observable<Account> {
    return of(this.account);
  }

  private getAccountFromAPI(): Observable<Account> {
    return this.accountService.getWithToken().pipe(
      shareReplay(1),
      tap((accountFromAPI) => {
        this.account = accountFromAPI;
        if (isUser(accountFromAPI)) {
          this.authService.startRefreshTokenTimer();
        }
      }),
      map((accountFromAPI) => accountFromAPI),
      catchError((err) => {
        this.authService.logout(isUser(this.account));
        return throwError(err);
      })
    );
  }
}
