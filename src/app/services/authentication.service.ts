import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map, tap} from 'rxjs/operators';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {GlobalConstants} from '@core/utils/global-constants';
import {makeApiURL} from '@core/utils/make-api-url';
import {Router} from '@angular/router';
import {CookieService} from 'ngx-cookie-service';

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
              private router: Router) {
  }

  isAuthenticated(): boolean {
    this.isLoggedIn = !!this.cookieService.get(this.cookieValue);
    return this.isLoggedIn;
  }

  logIn(username: string, password: string): Observable<any> {
    const header = new HttpHeaders().set('Authorization', 'Basic ' + btoa(username + ':' + password));
    return this.http.get(this.API_URL + 'user/login', {headers: header}).pipe(
      tap((response: any) => {
          this.isLoggedIn = true;
          this.router.navigate([this._lastAuthenticatedPath]);
          this.cookieService.set(this.cookieValue, response.user_token, 0.5, '/');
          this.startRefreshTokenTimer();
        }
      )
    );
  }

  logOut(): Observable<any> {
    return this.http.get(this.API_URL + 'user/logout').pipe(
      tap(() => {
          this.isLoggedIn = false;
          this.router.navigate(['/connexion']);
          this.cookieService.delete(this.cookieValue, '/');
          this.stopRefreshTokenTimer();
        }
      )
    );
  }

  startRefreshTokenTimer(): void {
    const token = this.cookieService.get(this.cookieValue);

    // Parse json object from base64 encoded jwt token
    const jwtToken = JSON.parse(atob(token.split('.')[1]));
    const expires = new Date(jwtToken.exp * 1000);

    // Set a timeout to refresh the token a minute before it expires
    const timeout = expires.getTime() - Date.now() - (60 * 1000);

    this.refreshTokenTimeout = setTimeout(() => this.refreshToken().subscribe(response => {
      this.cookieService.set(this.cookieValue, response.refresh_token, 0.5, '/');
    }), timeout);
  }

  refreshToken(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}user/refresh_token`)
      .pipe(map((user) => {
        this.startRefreshTokenTimer();
        return user;
      }));
  }

  private stopRefreshTokenTimer(): void {
    clearTimeout(this.refreshTokenTimeout);
  }
}
