import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {distinctUntilChanged, filter, switchMap} from 'rxjs/operators';
import {combineLatest, Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {PermissionsService} from '@services/permissions.service';
import {SelectedSiteService} from '@services/selected-site.service';
import {Site} from '@shared/models/site.model';
import {Pages} from '@core/utils/pages';
import {Project} from '@shared/models/project.model';
import {ProjectService} from '@services/project.service';
import {SelectedProjectService} from '@services/selected-project.service';
import {ServiceService} from '@services/service.service';

@Component({
  selector: 'app-project-selector',
  templateUrl: './project-selector.component.html',
  styleUrls: ['./project-selector.component.scss']
})
export class ProjectSelectorComponent implements OnInit, OnDestroy {
  @Input() allOption: boolean;
  @Input() hideIfOnlyOne = false;
  @Output() selectedProjectChange = new EventEmitter();
  projects: Project[] = [];
  selectedProject: Project;
  refreshing: boolean;
  private subscription: Subscription;

  constructor(private router: Router,
              private projectService: ProjectService,
              private serviceService: ServiceService,
              private permissionsService: PermissionsService,
              private selectedSiteService: SelectedSiteService,
              private selectedProjectService: SelectedProjectService) {
  }

  ngOnInit(): void {
    this.getProjects();
  }

  private getProjects(): void {
    const selectedSite$ = this.selectedSiteService.getSelectedSite();
    const service$ = this.serviceService.getByKey();
    const selectedProject$ = this.selectedProjectService.getSelectedProject();

    this.subscription = combineLatest([selectedSite$, service$]).pipe(
      distinctUntilChanged((a, b) => a[0].id_site === b[0].id_site),
      filter(([selectedSite, service]) => this.isSiteValid(selectedSite)),
      switchMap(([selectedSite, service]) => {
        this.refreshing = true;
        return combineLatest([selectedProject$, this.projectService.getBySite(selectedSite.id_site, service[0].id_service)]);
      })
    ).subscribe(([selectedProject, projects]) => {
      this.projects = projects;
      this.setSelectedProject(selectedProject);
      this.checkIfUniqueProject();
      this.refreshing = false;
    });
  }

  private isSiteValid(site: Site): boolean {
    const isSiteValid = !!site && !!site.id_site;
    if (!isSiteValid) {
      this.router.navigate([Pages.homePage]).then();
    }
    return isSiteValid;
  }

  private checkIfUniqueProject(): void {
    if (!!this.projects && this.projects.length === 1) {
      this.onValueChanged(this.projects[0]);
    }
  }

  onValueChanged(selected: Project): void {
    if (selected && this.isDifferentProject(selected)) {
      this.selectedProjectService.setSelectedProject(selected);
      this.getProjectPermission(selected);
    }
  }

  private isDifferentProject(project: Project): boolean {
    return this.selectedProject?.id_project !== project?.id_project;
  }

  private getProjectPermission(project: Project): void {
    this.permissionsService.getProjectPermission(project.id_project).subscribe();
  }

  private setSelectedProject(selectedProject: Project): void {
    if (selectedProject) {
      const alreadySelected = this.projects.find(p => p.id_project === selectedProject.id_project);
      if (alreadySelected) {
        this.selectedProject = alreadySelected;
      }
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  manageProjects(): boolean {
    if (this.hideIfOnlyOne){
      return (!!this.projects && this.projects.length > 1);
    }
    return true; // Show all by default
  }
}
