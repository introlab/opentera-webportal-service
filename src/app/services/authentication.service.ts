import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map, switchMap, tap} from 'rxjs/operators';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {GlobalConstants} from '@core/utils/global-constants';
import {makeApiURL} from '@core/utils/make-api-url';
import {Router} from '@angular/router';
import {CookieService} from 'ngx-cookie-service';
import {AccountService} from '@services/account.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private defaultPath = '/';
  private cookieValue = GlobalConstants.cookieValue;
  private API_URL = makeApiURL();
  private refreshTokenTimeout: any;
  private isLoggedIn = false;

  private _lastAuthenticatedPath: string = this.defaultPath;
  set lastAuthenticatedPath(value: string) {
    this._lastAuthenticatedPath = value;
  }

  constructor(private http: HttpClient,
              private cookieService: CookieService,
              private accountService: AccountService,
              private router: Router) {
  }

  isAuthenticated(): boolean {
    this.isLoggedIn = !!this.cookieService.get(this.cookieValue);
    return this.isLoggedIn;
  }

  login(username: string, password: string, isManager: boolean = false): Observable<any> {
    const apiUrl = isManager ? `${this.API_URL}user/login` : `${this.API_URL}participant/login`;
    const header = new HttpHeaders().set('Authorization', 'Basic ' + btoa(username + ':' + password));
    return this.http.get(apiUrl, {headers: header}).pipe(
      tap((response: any) => {
        const token = isManager ? response.user_token : response.participant_token;
        this.isLoggedIn = true;
        this.cookieService.set(this.cookieValue, token, 0.5, '/');
        this.router.navigate([this._lastAuthenticatedPath]);
        this.startRefreshTokenTimer();
      })
    );
  }

  logout(isManager: boolean = false): Observable<any> {
    const apiUrl = isManager ? `${this.API_URL}user/logout` : `${this.API_URL}participant/logout`;
    return this.http.get(apiUrl).pipe(
      tap(() => {
        this.isLoggedIn = false;
        this.router.navigate([GlobalConstants.loginPage]);
        this.cookieService.delete(this.cookieValue, '/');
        this.stopRefreshTokenTimer();
      })
    );
  }

  startRefreshTokenTimer(): void {
    const token = this.cookieService.get(GlobalConstants.cookieValue);

    // Parse json object from base64 encoded jwt token
    const jwtToken = JSON.parse(atob(token.split('.')[1]));
    const expires = new Date(jwtToken.exp * 1000);

    // Set a timeout to refresh the token a minute before it expires
    const timeout = expires.getTime() - Date.now() - (60 * 1000);

    this.refreshTokenTimeout = setTimeout(() => this.refreshToken().subscribe(response => {
      this.cookieService.set(GlobalConstants.cookieValue, response.refresh_token, 0.5, '/', undefined, true, 'None');
    }), timeout);
  }

  refreshToken(): Observable<any> {
    return this.accountService.account$().pipe(
      switchMap((account) => {
        const apiUrl = account.login_type === 'user' ? `${this.API_URL}user/refresh_token` : `${this.API_URL}participant/refresh_token`;
        return this.http.get<any>(apiUrl)
          .pipe(map((user) => {
            this.startRefreshTokenTimer();
            return user;
          }));
      })
    );
  }

  private stopRefreshTokenTimer(): void {
    clearTimeout(this.refreshTokenTimeout);
  }
}
