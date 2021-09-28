import {Component, Input, OnInit} from '@angular/core';
import {Application} from '@shared/models/application.model';
import {SelectedSourceService} from '@services/selected-source.service';
import {Router} from '@angular/router';
import {Pages} from '@core/utils/pages';

@Component({
  selector: 'app-link',
  templateUrl: './app-link.component.html',
  styleUrls: ['./app-link.component.scss']
})
export class AppLinkComponent implements OnInit {
  @Input() app!: Application;
  link: any;

  constructor(private selectedSourceService: SelectedSourceService,
              private router: Router) {
  }

  ngOnInit(): void {
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
    if (this.app.app_config) {
      this.selectedSourceService.setSelectedSource(this.app.app_config.app_config_url);
    } else {
      this.selectedSourceService.setSelectedSource('');
    }
  }
}
