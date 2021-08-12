import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {GlobalConstants} from '@core/utils/global-constants';

@Component({
  selector: 'app-callback',
  templateUrl: './callback.component.html',
  styleUrls: ['./callback.component.scss']
})
export class CallbackComponent implements OnInit {

  constructor(private activatedRoute: ActivatedRoute,
              private router: Router) {
  }

  public ngOnInit(): void {
    console.log('callback');
    this.activatedRoute.queryParams.subscribe((params) => {
      console.log(params);
      const token = params.token;

      if (!!params.token) {
        this.router.navigate([GlobalConstants.homePage]);
      } else {
        this.router.navigate([GlobalConstants.loginPage]);
      }

    });
  }

}
