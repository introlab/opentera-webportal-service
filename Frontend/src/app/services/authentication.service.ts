import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map, switchMap, tap} from 'rxjs/operators';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {GlobalConstants} from '@core/utils/global-constants';
import {makeApiURL} from '@core/utils/make-api-url';
import {Router} from '@angular/router';
import {CookieService} from 'ngx-cookie-service';
import {AccountService} from '@services/account.service';
import {Pages} from '@core/utils/pages';
import {SelectedProjectService} from '@services/selected-project.service';
import {SelectedSiteService} from '@services/selected-site.service';
import {Site} from '@shared/models/site.model';
import {Project} from '@shared/models/project.model';
import {PermissionsService} from '@services/permissions.service';
import {WebsocketService} from '@services/websocket.service';

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
              private selectedProjectService: SelectedProjectService,
              private selectedSiteService: SelectedSiteService,
              private permissionsService: PermissionsService,
              private websocketService: WebsocketService,
              private router: Router) {
  }

  isAuthenticated(): boolean {
    this.isLoggedIn = !!this.cookieService.get(this.cookieValue);
    return this.isLoggedIn;
  }

  login(username: string, password: string, isManager: boolean = false): Observable<any> {
    const apiUrl = isManager ? `${this.API_URL}user/login?with_websocket=true` : `${this.API_URL}participant/login`;
    const headers = new HttpHeaders().set('Authorization', 'Basic ' + btoa(username + ':' + password));
    return this.http.get(apiUrl, {headers}).pipe(
      tap((response: any) => {
        const token = isManager ? response.user_token : response.participant_token;
        this.isLoggedIn = true;
        this.cookieService.set(this.cookieValue, token, 0.5, '/');
        this.router.navigate([this._lastAuthenticatedPath]);
        // Connect websocket
        this.websocketService.connect(response.websocket_url);
        this.startRefreshTokenTimer();
      })
    );
  }

  loginWithToken(token: string): void {
    this.isLoggedIn = true;
    this.cookieService.set(this.cookieValue, token, null, '/');
    this.router.navigate([this._lastAuthenticatedPath]);
  }

  logout(isManager: boolean = false): Observable<any> {
    const apiUrl = isManager ? `${this.API_URL}user/logout` : `${this.API_URL}participant/logout`;
    return this.http.get(apiUrl).pipe(
      tap(() => {
        this.reset();
      })
    );
  }

  reset(): void {
    this.isLoggedIn = false;
    this.router.navigate([Pages.loginPage]);
    this.cookieService.delete(this.cookieValue, '/');
    this.selectedProjectService.setSelectedProject(new Project());
    this.selectedSiteService.setSelectedSite(new Site());
    this.permissionsService.initializePermissions();
    this.websocketService.close();
    this.stopRefreshTokenTimer();
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
        const apiUrl = account.login_type === 'user' ? `${this.API_URL}user/refresh_token?with_websocket=true` : `${this.API_URL}participant/refresh_token`;
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
