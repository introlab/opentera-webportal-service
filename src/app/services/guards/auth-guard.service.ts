import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router} from '@angular/router';
import {AuthenticationService} from '@services/authentication.service';
import {GlobalConstants} from '@core/utils/global-constants';

@Injectable()
export class AuthGuardService implements CanActivate {
  constructor(private router: Router,
              private authService: AuthenticationService) {
  }

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate([GlobalConstants.loginPage]);
      return false;
    }
    return true;
  }
}
