import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ApplicationService} from '@services/application.service';
import {SelectedProjectService} from '@services/selected-project.service';
import {switchMap, take} from 'rxjs/operators';
import {Observable, Subscription} from 'rxjs';
import {Application} from '@shared/models/application.model';
import {MatTableDataSource} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {ConfirmationComponent} from '@components/confirmation/confirmation.component';
import {NotificationService} from '@services/notification.service';
import {MatDialog} from '@angular/material/dialog';
import {GlobalConstants} from '@core/utils/global-constants';
import {ApplicationFormComponent} from '@components/forms/application-form/application-form.component';
import {Router} from '@angular/router';
import {Project} from '@shared/models/project.model';
import {Pages} from '@core/utils/pages';

@Component({
  selector: 'app-applications',
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.scss']
})
export class ApplicationsComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(MatSort, {static: false}) sort: MatSort;
  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  applications: Application[] = [];
  dataSource: MatTableDataSource<Application>;
  applicationTypes = GlobalConstants.applicationTypes;
  displayedColumns: string[] = ['app_order', 'app_name', 'type', 'status', 'controls'];
  private subscriptions: Subscription[] = [];
  private selectedProject: Project;

  constructor(private appService: ApplicationService,
              private notificationService: NotificationService,
              public dialog: MatDialog,
              private router: Router,
              private selectedProjectService: SelectedProjectService) {
    this.setDataSource();
  }

  private static createEmptyApplication(): Application {
    const emptyApp = new Application();
    emptyApp.id_app = 0;
    emptyApp.app_enabled = true;
    emptyApp.app_order = 1;
    emptyApp.app_type = GlobalConstants.applicationTypes.external;
    return emptyApp;
  }

  ngOnInit(): void {
    this.getApps();
    this.refreshProject();
  }

  private refreshProject(): void {
    this.subscriptions.push(
      this.selectedProjectService.getSelectedProject().pipe(
        switchMap((project) => {
          this.selectedProject = project;
          return this.refreshApps();
        })
      ).subscribe()
    );
  }

  private refreshApps(): Observable<Application[]> {
    return this.appService.getByProject(this.selectedProject.id_project);
  }

  private getApps(): void {
    this.subscriptions.push(this.appService.applications$().subscribe((apps) => {
        this.applications = apps;
        this.setDataSource();
      })
    );
  }

  private setDataSource(): void {
    this.dataSource = new MatTableDataSource(this.applications);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngAfterViewInit(): void {
    this.dataSource = new MatTableDataSource(this.applications);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  deactivate(app: Application): void {
    if (app.app_enabled) {
      this.confirmDeactivation(app);
    } else if (app.app_deletable) {
      this.confirmDelete(app);
    } else {
      this.notificationService.showError('Cette section ne peut pas être supprimée.');
    }
  }

  private confirmDeactivation(app: Application): void {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      width: '350px',
      data: 'Êtes-vous sûr de vouloir désactiver cette section?'
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        app.app_enabled = false;
        this.appService.update(app).subscribe(() => {
          this.notificationService.showSuccess('La section ' + app.app_name + ' a été désactivée.');
        }, err => {
          console.error('Ce compte ne possède pas les permissions pour désactiver cette section.', err);
          this.notificationService.showError('Ce compte ne possède pas les permissions pour désactiver cette section.');
        });
      }
    });
  }

  private confirmDelete(app: Application): void {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      width: '350px',
      data: 'Êtes-vous sûr de vouloir supprimer cette section?'
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.appService.delete(app.id_app).subscribe(() => {
          this.notificationService.showSuccess('La section ' + app.app_name + ' a été supprimée.');
        }, err => {
          console.error('Ce compte ne possède pas les permissions pour supprimer cette section.', err);
          this.notificationService.showError('Ce compte ne possède pas les permissions pour supprimer cette section.');
        });
      }
    });
  }

  openForm(app: Application): void {
    const copy = {...app};
    const dialogRef = this.dialog.open(ApplicationFormComponent, {
      width: '500px',
      disableClose: true,
      data: !!app ? copy : ApplicationsComponent.createEmptyApplication()
    });

    dialogRef.afterClosed().pipe(
      take(1)
    ).subscribe((result) => {
      if (result) {
        if (!result.id_app) {
          result.id_app = 0;
        }
        this.appService.update(result).pipe(
          switchMap((updated) => {
            this.router.navigate([Pages.createPath(Pages.applicationsPage, true)]);
            this.notificationService.showSuccess('La section ' + updated[0].app_name + ' a été sauvegardée.');
            return this.refreshApps();
          })
        ).subscribe();
      }
    });
  }
}
