import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {Subscription} from 'rxjs';
import {Site} from '@shared/models/site.model';
import {Router} from '@angular/router';
import {distinctUntilKeyChanged, filter, switchMap} from 'rxjs/operators';
import {SelectedSiteService} from '@services/selected-site.service';
import {PermissionsService} from '@services/permissions.service';
import {Project} from '@shared/models/project.model';

@Component({
  selector: 'app-site-selector',
  templateUrl: './site-selector.component.html',
  styleUrls: ['./site-selector.component.scss']
})
export class SiteSelectorComponent implements OnInit, OnChanges, OnDestroy {
  @Input() sites: Site[] = [];
  selectedSite: Site;
  private subscription: Subscription;

  constructor(private router: Router,
              private permissionsService: PermissionsService,
              private selectedSiteService: SelectedSiteService) {
  }

  private static filterSite(site: Site): boolean {
    return !!site && !!site.id_site;
  }

  ngOnInit(): void {
    this.subscription = this.selectedSiteService.getSelectedSite().pipe(
      distinctUntilKeyChanged('id_site'),
      filter((site) => SiteSelectorComponent.filterSite(site)),
      switchMap((site) => {
        this.selectedSite = site;
        return this.permissionsService.getSitePermission(this.selectedSite.id_site);
      })
    ).subscribe();
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
      this.getSitePermission(selected);
    }
  }

  private getSitePermission(site: Site): void {
    this.permissionsService.getSitePermission(site.id_site).subscribe();
  }

  manageSites(): boolean {
    return !!this.sites && this.sites.length > 0;
  }
}
