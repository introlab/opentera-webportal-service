import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {ShowResponsiveNavigationService} from '@services/show-responsive-navigation.service';
import {AccountService} from '@services/account.service';
import {combineLatest, Subscription} from 'rxjs';
import {Application} from '@shared/models/application.model';
import {isUser} from '@core/utils/utility-functions';
import {Pages} from '@core/utils/pages';
import {PermissionsService} from '@services/permissions.service';
import {Permission} from '@shared/models/permission.model';

const links: any = [
  {
    id: 1,
    name: 'Accueil',
    path: Pages.calendarPage,
    forProjectAdmin: false
  },
  {
    id: 2,
    name: 'Participants',
    path: Pages.createPath(Pages.participantsPage, true),
    forProjectAdmin: false
  },
  {
    id: 3,
    name: 'Sections',
    path: Pages.createPath(Pages.applicationsPage, true),
    forProjectAdmin: true
  },
  {
    id: 4,
    name: 'Planification',
    path: Pages.createPath(Pages.planningPage, true),
    forProjectAdmin: false
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
  permissions: Permission;
  private subscription!: Subscription;

  @HostListener('click') onClick(): void {
    this.closeResponsiveNavigation();
  }

  constructor(private showResponsiveNavigationService: ShowResponsiveNavigationService,
              private permissionsService: PermissionsService,
              private accountService: AccountService) {
  }

  ngOnInit(): void {
    const account$ = this.accountService.account$();
    const permissions$ = this.permissionsService.permissions$();

    this.subscription = combineLatest([account$, permissions$]).subscribe(([account, permissions]) => {
      this.isUser = isUser(account);
      if (this.isUser) {
        this.userLinks = links;
      } else {
        this.participantApps = account.apps;
      }
      this.permissions = permissions;
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
