import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Application} from '@shared/models/application.model';
import {SelectedSourceService} from '@services/selected-source.service';
import {Router} from '@angular/router';
import {Pages} from '@core/utils/pages';
import {AccountService} from '@services/account.service';
import {Subscription} from 'rxjs';
import {Account} from '@shared/models/account.model';

@Component({
  selector: 'app-link',
  templateUrl: './app-link.component.html',
  styleUrls: ['./app-link.component.scss']
})
export class AppLinkComponent implements OnInit, OnDestroy {
  @Input() app!: Application;
  link: any;
  private subscription: Subscription;
  private account: Account;

  constructor(private selectedSourceService: SelectedSourceService,
              private accountService: AccountService,
              private router: Router) {
  }

  ngOnInit(): void {
    this.subscription = this.accountService.account$().subscribe((account) => this.account = account);
  }

  showApp(): void {
    switch (this.app.app_name.toLocaleLowerCase()) {
      case 'calendrier':
        this.router.navigate([Pages.calendarPage]);
        break;
      case 'courriel':
        this.router.navigate([Pages.createPath(Pages.emailPage)]);
        break;
      default:
        this.router.navigate([Pages.createPath(Pages.appPage), {app: this.app.app_name?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}]);
    }
    if (this.app.app_config.app_config_url && this.app.app_config.app_config_url.length > 0) {
      this.selectedSourceService.setSelectedSource(this.app.app_config.app_config_url);
    } else {
      this.selectedSourceService.setSelectedSource(this.app.app_static_url);
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
