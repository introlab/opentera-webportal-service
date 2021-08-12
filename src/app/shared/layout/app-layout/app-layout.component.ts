import {Component, OnDestroy, OnInit} from '@angular/core';
import {ShowResponsiveNavigationService} from '@services/show-responsive-navigation.service';
import {Subscription} from 'rxjs';
import {AccountService} from '@services/account.service';
import {Account} from '@shared/models/account.model';

@Component({
  selector: 'app-app-layout',
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.scss']
})
export class AppLayoutComponent implements OnInit, OnDestroy {
  navigationOpened = false;
  private subscription!: Subscription;
  private account!: Account;

  constructor(private showNavService: ShowResponsiveNavigationService,
              private accountService: AccountService) {
  }

  ngOnInit(): void {
    const showNav$ = this.showNavService.showNavigation();

    this.subscription = showNav$.subscribe((showNav) => {
      this.navigationOpened = showNav;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
