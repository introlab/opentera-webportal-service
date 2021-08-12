import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {environment} from '@src/environments/environment';
import {GlobalConstants} from '@core/utils/global-constants';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  imagePath = environment.img_prefix + 'assets/images/leaf.svg';

  constructor(public router: Router) {
  }

  ngOnInit(): void {
  }

  goHome(): void {
    this.router.navigate([GlobalConstants.homePage]);
  }
}
