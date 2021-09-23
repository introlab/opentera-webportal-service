import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {ShowResponsiveNavigationService} from '@services/show-responsive-navigation.service';
import {AccountService} from '@services/account.service';
import {Subscription} from 'rxjs';
import {Application} from '@shared/models/application.model';
import {isUser} from '@core/utils/utility-functions';
import {GlobalConstants} from '@core/utils/global-constants';

const links: any = [
  {
    id: 1,
    name: 'Accueil',
    path: GlobalConstants.calendarPage,
  },
  {
    id: 2,
    name: 'Participants',
    path: GlobalConstants.participantsPage,
  },
  {
    id: 3,
    name: 'Sections',
    path: GlobalConstants.sectionsPage,
  },
  {
    id: 4,
    name: 'Planification',
    path: GlobalConstants.planningPage,
  },
];

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit, OnDestroy {
  participantApps: Application[] = [];
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

  trackByFn(index: number, item: Application): number | undefined {
    return item.id_app;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
