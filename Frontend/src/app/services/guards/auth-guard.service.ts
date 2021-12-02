import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router} from '@angular/router';
import {AuthenticationService} from '@services/authentication.service';
import {Pages} from '@core/utils/pages';

@Injectable()
export class AuthGuardService implements CanActivate {
  constructor(private router: Router,
              private authService: AuthenticationService) {
  }

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate([Pages.loginPage]);
      return false;
    }
    return true;
  }
}
