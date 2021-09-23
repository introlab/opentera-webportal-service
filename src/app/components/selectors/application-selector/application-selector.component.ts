import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import { Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {SelectedProjectService} from '@services/selected-project.service';
import {distinctUntilChanged, switchMap} from 'rxjs/operators';
import {ApplicationService} from '@services/application.service';
import {Application} from '@shared/models/application.model';
import {GlobalConstants} from '@core/utils/global-constants';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';

@Component({
  selector: 'app-application-selector',
  templateUrl: './application-selector.component.html',
  styleUrls: ['./application-selector.component.scss']
})
export class ApplicationSelectorComponent implements OnInit, OnDestroy {
  @Input() participantApps: Application[];
  @Output() selectedAppsChange = new EventEmitter();
  @ViewChild(MatSort, {static: false}) sort: MatSort;
  displayedColumns: string[] = ['app_name', 'url', 'controls'];
  applications: Application[] = [];
  selectedApplications: Application[] = [];
  refreshing: boolean;
  selectedApplication: Application;
  types = GlobalConstants.applicationTypes;
  required = GlobalConstants.requiredMessage;
  dataSource: MatTableDataSource<Application>;
  private subscription: Subscription;

  constructor(private router: Router,
              private appService: ApplicationService,
              private selectedProjectService: SelectedProjectService) {
  }

  ngOnInit(): void {
    this.selectedApplications = this.participantApps;
    this.setDataSource();
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
      this.setDataSource();
    }
  }

  remove(idApp: number): void {
    this.selectedApplications = this.selectedApplications.filter(p => p.id_app !== idApp);
    this.selectedAppsChange.emit(this.selectedApplications);
    this.setDataSource();
  }

  private setDataSource(): void {
    this.dataSource = new MatTableDataSource(this.selectedApplications);
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  updateURL(event: Event, idApp: number): void {
    console.log(event, idApp);
  }
}
