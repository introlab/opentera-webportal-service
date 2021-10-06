import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import { Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {SelectedProjectService} from '@services/selected-project.service';
import {distinctUntilChanged, switchMap} from 'rxjs/operators';
import {ApplicationService} from '@services/application.service';
import {Application} from '@shared/models/application.model';
import {GlobalConstants} from '@core/utils/global-constants';
import {MatTableDataSource} from '@angular/material/table';

@Component({
  selector: 'app-application-selector',
  templateUrl: './application-selector.component.html',
  styleUrls: ['./application-selector.component.scss']
})
export class ApplicationSelectorComponent implements OnInit, OnDestroy {
  @Input() participantApps: Application[];
  @Output() selectedAppsChange = new EventEmitter();
  applications: Application[] = [];
  selectedApplications: Application[] = [];
  refreshing: boolean;
  types = GlobalConstants.applicationTypes;
  required = GlobalConstants.requiredMessage;
  private subscription: Subscription;

  constructor(private router: Router,
              private appService: ApplicationService,
              private selectedProjectService: SelectedProjectService) {
  }

  ngOnInit(): void {
    // TODO create form with form control with app names
    this.selectedApplications = this.participantApps;
    this.getApplications();
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
      this.applications = applications;
      this.refreshing = false;
    });
  }

  onValueChanged(selected: Application): void {
    const alreadySelected = this.selectedApplications.find(p => p.id_app === selected.id_app);
    if (!alreadySelected) {
      this.selectedApplications.unshift(selected);
      this.selectedAppsChange.emit(this.selectedApplications);
    }
  }

  remove(idApp: number): void {
    this.selectedApplications = this.selectedApplications.filter(p => p.id_app !== idApp);
    this.selectedAppsChange.emit(this.selectedApplications);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  updateURL(event: Event, idApp: number): void {
    console.log(event, idApp);
  }
}
