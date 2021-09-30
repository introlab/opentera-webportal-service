import {Component, OnDestroy, OnInit} from '@angular/core';
import {ShowResponsiveNavigationService} from '@services/show-responsive-navigation.service';
import {combineLatest, Subscription} from 'rxjs';
import {AccountService} from '@services/account.service';
import {Account} from '@shared/models/account.model';
import {SelectedSiteService} from '@services/selected-site.service';
import {SelectedProjectService} from '@services/selected-project.service';
import {Site} from '@shared/models/site.model';
import {Project} from '@shared/models/project.model';
import {isObjectEmpty, isUser} from '@core/utils/utility-functions';
import {ServiceService} from '@services/service.service';
import {filter, switchMap, tap} from 'rxjs/operators';

@Component({
  selector: 'app-app-layout',
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.scss']
})
export class AppLayoutComponent implements OnInit, OnDestroy {
  navigationOpened = false;
  account: Account;
  selectedSite: Site;
  selectedProject: Project;
  isUser = false;
  showSelectors = false;
  showBackButtonSelectors = false;
  private subscriptions: Subscription[] = [];

  constructor(private showNavService: ShowResponsiveNavigationService,
              private accountService: AccountService,
              private serviceService: ServiceService,
              private selectedSiteService: SelectedSiteService,
              private selectedProjectService: SelectedProjectService) {
  }

  ngOnInit(): void {
    this.getService();
    this.getSessionData();
  }

  private getService(): void {
    const account$ = this.accountService.account$();
    this.subscriptions.push(
      account$.pipe(
        tap((account) => this.account = account),
        filter((account) => isUser(account)),
        switchMap(() => this.serviceService.getByKey())
      ).subscribe()
    );
  }

  private getSessionData(): void {
    const account$ = this.accountService.account$();
    const showNav$ = this.showNavService.showNavigation();
    const selectedSite$ = this.selectedSiteService.getSelectedSite();
    const selectedProject$ = this.selectedProjectService.getSelectedProject();

    this.subscriptions.push(
      combineLatest([account$, showNav$, selectedSite$, selectedProject$])
        .subscribe(([account, showNav, selectedSite, selectedProject]) => {
          this.account = account;
          this.navigationOpened = showNav;
          this.selectedSite = selectedSite;
          this.selectedProject = selectedProject;
          this.isUser = isUser(account);
          this.showBackButtonSelectors = !isObjectEmpty(selectedSite) && !isObjectEmpty(selectedProject);
          this.showSelectors = this.isUser && this.showBackButtonSelectors && this.selectedProject.id_site === this.selectedSite.id_site;
        })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
