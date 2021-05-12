import {Injectable, Injector, NgZone} from '@angular/core';
import {HttpEvent, HttpRequest, HttpHandler, HttpInterceptor, HttpErrorResponse} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {retry, catchError} from 'rxjs/operators';
import {Router} from '@angular/router';
import {AuthenticationService} from '@services/authentication.service';
import {LoginButtonService} from '@services/login-button.service';
import {NotificationService} from '@services/notification.service';

@Injectable()
export class ServerErrorInterceptor implements HttpInterceptor {

  constructor(private injector: Injector,
              private router: Router) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const ngZone = this.injector.get(NgZone);
    const authService = this.injector.get(AuthenticationService);
    const notifier = this.injector.get(NotificationService);
    const loginButton = this.injector.get(LoginButtonService);

    return next.handle(request).pipe(
      retry(1),
      catchError((error: HttpErrorResponse) => {
        if (error.url && error.url.includes('/login')) {
          loginButton.disableButton(false);
          notifier.showError('Mauvais nom d\'utilisateur ou mot de passe.');
        }
        if (error.status === 401) {
          authService.logout().subscribe();
          ngZone.run(() => this.router.navigate(['/connexion']));
        }
        return throwError(error);
      })
    );
  }
}
