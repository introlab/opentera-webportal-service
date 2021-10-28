import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Pages} from '@core/utils/pages';
import {AuthenticationService} from '@services/authentication.service';

@Component({
  selector: 'app-callback',
  templateUrl: './callback.component.html',
  styleUrls: ['./callback.component.scss']
})
export class CallbackComponent implements OnInit {

  constructor(private activatedRoute: ActivatedRoute,
              private router: Router,
              private authenticationService: AuthenticationService) {
  }

  public ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params) => {
      const token = params.token;

      if (!!params.token) {
        this.authenticationService.loginWithToken(token);
      } else {
        this.router.navigate([Pages.loginPage]);
      }
    });
  }
}
