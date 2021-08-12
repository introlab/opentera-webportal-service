import {Component, OnInit} from '@angular/core';
import {environment} from '@src/environments/environment';
import {Router} from '@angular/router';
import {GlobalConstants} from '@core/utils/global-constants';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent implements OnInit {
  imagePath = environment.img_prefix + 'assets/images/puzzle.svg';

  constructor(public router: Router) {
  }

  ngOnInit(): void {
  }

  goHome(): void {
    this.router.navigate([GlobalConstants.homePage]);
  }
}
