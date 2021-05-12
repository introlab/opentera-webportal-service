import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {ShowResponsiveNavigationService} from '@services/show-responsive-navigation.service';
import {UserInfosService} from '@services/user-infos.service';
import {Subscription} from 'rxjs';
import {App} from '@shared/models/app.model';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit, OnDestroy {
  apps: App[] = [];
  private subscription!: Subscription;

  @HostListener('click') onClick(): void {
    this.closeResponsiveNavigation();
  }

  constructor(private showResponsiveNavigationService: ShowResponsiveNavigationService,
              private userInfosService: UserInfosService) {
  }

  ngOnInit(): void {
    this.subscription = this.userInfosService.userInfos$().subscribe((res) => {
      if (res.apps && res.apps.length > 0) {
        console.log(res.apps);
        this.apps = res.apps;
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
