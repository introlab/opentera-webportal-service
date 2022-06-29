import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {SelectedProjectService} from '@services/selected-project.service';
import {distinctUntilChanged, switchMap} from 'rxjs/operators';
import {ApplicationService} from '@services/application.service';
import {Application} from '@shared/models/application.model';
import {GlobalConstants} from '@core/utils/global-constants';
import {FormControl, FormGroup} from '@angular/forms';
import {ApplicationConfig} from '@shared/models/application-config.model';

@Component({
  selector: 'app-application-selector',
  templateUrl: './application-selector.component.html',
  styleUrls: ['./application-selector.component.scss']
})
export class ApplicationSelectorComponent implements OnInit, OnChanges, OnDestroy {

  constructor(private router: Router,
              private appService: ApplicationService,
              private selectedProjectService: SelectedProjectService) {
  }
  static ignore_apps = ['courriel', 'calendrier'];
  @Input() appConfigs: ApplicationConfig[] = [];
  @Input() form: FormGroup;
  @Output() selectedAppsChange = new EventEmitter();
  applications: Application[] = [];
  refreshing: boolean;
  types = GlobalConstants.applicationTypes;
  required = GlobalConstants.requiredMessage;
  private subscription: Subscription;

  ngOnInit(): void {
  }

  private getApplications(): void {
    const selectedProject$ = this.selectedProjectService.getSelectedProject();

    this.subscription = selectedProject$.pipe(
      distinctUntilChanged((a, b) => a.id_project === b.id_project),
      switchMap((selectedProject) => {
        this.refreshing = true;
        return this.appService.getByProject(selectedProject.id_project);
      })
    ).subscribe((applications) => {
      this.applications = applications.filter(a => !ApplicationSelectorComponent.ignore_apps.includes(a.app_name.toLowerCase()));
      this.refreshing = false;
      this.applications.forEach((app) => {
          this.form.addControl('app_' + app.app_name, new FormControl(''));
      });
      this.appConfigs.forEach((config) => {
          if (this.applications.find(app => app.id_app === config.id_app)){
            this.form.controls['app_' + config.application.app_name].setValue(config.app_config_url);
          }
      });
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.getApplications();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  moodleAppHasId(app: Application): boolean {
    const app_infos = app.app_static_url.split(' ');
    return !(app_infos[0] === '' || app_infos[0] === 'message');
  }
}
