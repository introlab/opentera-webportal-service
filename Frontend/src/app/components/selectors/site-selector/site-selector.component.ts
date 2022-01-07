import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {combineLatest, Observable, of, Subscription} from 'rxjs';
import {Site} from '@shared/models/site.model';
import {Router} from '@angular/router';
import {distinctUntilChanged, distinctUntilKeyChanged, filter, switchMap, tap} from 'rxjs/operators';
import {SelectedSiteService} from '@services/selected-site.service';
import {PermissionsService} from '@services/permissions.service';
import {AccountService} from '@services/account.service';
import {Permission} from '@shared/models/permission.model';

@Component({
  selector: 'app-site-selector',
  templateUrl: './site-selector.component.html',
  styleUrls: ['./site-selector.component.scss']
})
export class SiteSelectorComponent implements OnInit, OnChanges, OnDestroy {
  sites: Site[] = [];
  selectedSite: Site;
  private subscription: Subscription;

  constructor(private router: Router,
              private permissionsService: PermissionsService,
              private accountService: AccountService,
              private selectedSiteService: SelectedSiteService) {
  }

  private static filterSite(site: Site): boolean {
    return !!site && !!site.id_site;
  }

  ngOnInit(): void {
    const selectedSite$ = this.selectedSiteService.getSelectedSite();
    const account$ = this.accountService.account$();

    this.subscription = combineLatest([selectedSite$, account$]).pipe(
      distinctUntilChanged((a, b) => a[0].id_site === b[0].id_site),
      tap(([site, account]) => {
        this.sites = account.sites;
      }),
      filter(([site, account]) => SiteSelectorComponent.filterSite(site)),
      switchMap(([site, account]) => {
        this.selectedSite = site;
        return this.getSitePermission(this.selectedSite);
      })
    ).subscribe();
    this.refreshSites();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.refreshSites();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  refreshSites(): void {
    if (!!this.sites && this.sites.length === 1) {
      this.onValueChanged(this.sites[0]);
    }
  }

  onValueChanged(selected: Site): void {
    if (selected) {
      this.selectedSiteService.setSelectedSite(selected);
      this.getSitePermission(selected).subscribe();
    }
  }

  private getSitePermission(site: Site): Observable<Permission> {
    return this.permissionsService.getSitePermission(site.id_site);
  }

  manageSites(): boolean {
    return !!this.sites && this.sites.length > 0;
  }
}
