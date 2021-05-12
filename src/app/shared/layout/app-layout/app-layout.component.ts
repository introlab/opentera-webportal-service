import {Component, OnDestroy, OnInit} from '@angular/core';
import {ShowResponsiveNavigationService} from '@services/show-responsive-navigation.service';
import {Subscription} from 'rxjs';
import {UserInfosService} from '@services/user-infos.service';

@Component({
  selector: 'app-app-layout',
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.scss']
})
export class AppLayoutComponent implements OnInit, OnDestroy {
  navigationOpened = false;
  private subscription!: Subscription;

  constructor(private showNavService: ShowResponsiveNavigationService,
              private userInfosService: UserInfosService) {
  }

  ngOnInit(): void {
    this.subscription = this.showNavService.showNavigation().subscribe((res) => {
      this.navigationOpened = res;
    });

    this.userInfosService.getWithToken().subscribe((res) => {
      console.log(res);
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
