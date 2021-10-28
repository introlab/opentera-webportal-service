import {Component, OnInit} from '@angular/core';
import {ShowResponsiveNavigationService} from '@services/show-responsive-navigation.service';

@Component({
  selector: 'app-login-layout',
  templateUrl: './login-layout.component.html',
  styleUrls: ['./login-layout.component.scss']
})
export class LoginLayoutComponent implements OnInit {

  constructor(private showResponsiveNavigationService: ShowResponsiveNavigationService) {
  }

  ngOnInit(): void {
    this.showResponsiveNavigationService.setNavigationView(false);
  }
}
