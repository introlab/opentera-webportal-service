import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Application} from '@shared/models/application.model';
import {SelectedSourceService} from '@services/selected-source.service';
import {Router} from '@angular/router';
import {Pages} from '@core/utils/pages';
import {AccountService} from '@services/account.service';
import {Subscription} from 'rxjs';
import {Account} from '@shared/models/account.model';
import {CookieService} from 'ngx-cookie-service';
import {GlobalConstants} from '@core/utils/global-constants';
import {makeApiURL} from "@core/utils/make-api-url";

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
              private cookieService: CookieService,
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
    let app_url;
    if (this.app.app_type === GlobalConstants.applicationTypes.Moodle){
      // Moodle redirector
      app_url = makeApiURL(true) + 'app-redirect?id_app=' + this.app.id_app + '&token=' +
        this.cookieService.get(GlobalConstants.cookieValue);
    }else{
      if (this.app.app_config.app_config_url !== null && this.app.app_config.app_config_url.length > 0) {
        app_url = this.app.app_config.app_config_url;
      } else {
        app_url = this.app.app_static_url;
      }
    }

    this.selectedSourceService.setSelectedSource(app_url);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
