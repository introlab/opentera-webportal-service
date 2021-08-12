import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {ShowResponsiveNavigationService} from '@services/show-responsive-navigation.service';
import {AccountService} from '@services/account.service';
import {Subscription} from 'rxjs';
import {App} from '@shared/models/app.model';
import {isUser} from '@core/utils/utility-functions';
import {GlobalConstants} from '@core/utils/global-constants';

const links: any = [
  {
    id: 1,
    name: 'Calendrier',
    path: GlobalConstants.calendarPage,
  }
];

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit, OnDestroy {
  participantApps: App[] = [];
  userLinks: any[] = [];
  isUser = true;
  private subscription!: Subscription;

  @HostListener('click') onClick(): void {
    this.closeResponsiveNavigation();
  }

  constructor(private showResponsiveNavigationService: ShowResponsiveNavigationService,
              private accountService: AccountService) {
  }

  ngOnInit(): void {
    this.subscription = this.accountService.account$().subscribe((account) => {
      this.isUser = isUser(account);
      if (this.isUser) {
        this.userLinks = links;
      } else {
        this.participantApps = account.apps;
      }
    });
  }

  private closeResponsiveNavigation(): void {
    this.showResponsiveNavigationService.setNavigationView(false);
  }

  trackByFn(index: number, item: App): number | undefined {
    return item.id_app;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
