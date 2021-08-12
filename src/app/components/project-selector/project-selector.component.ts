import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {distinctUntilKeyChanged, filter, switchMap} from 'rxjs/operators';
import {combineLatest, Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {PermissionsService} from '@services/permissions.service';
import {SelectedSiteService} from '@services/selected-site.service';
import {Site} from '@shared/models/site.model';
import {GlobalConstants} from '@core/utils/global-constants';
import {Project} from '@shared/models/project.model';
import {ProjectService} from '@services/project.service';
import {SelectedProjectService} from '@services/selected-project.service';

@Component({
  selector: 'app-project-selector',
  templateUrl: './project-selector.component.html',
  styleUrls: ['./project-selector.component.scss']
})
export class ProjectSelectorComponent implements OnInit, OnDestroy {
  @Input() allOption: boolean;
  @Output() selectedProjectChange = new EventEmitter();
  projects: Project[] = [];
  selectedProject: Project;
  refreshing: boolean;
  private subscription: Subscription;

  constructor(private router: Router,
              private projectService: ProjectService,
              private permissionsService: PermissionsService,
              private selectedSiteService: SelectedSiteService,
              private selectedProjectService: SelectedProjectService) {
  }

  ngOnInit(): void {
    this.getProjects();
  }

  private getProjects(): void {
    this.subscription = this.selectedSiteService.getSelectedSite().pipe(
      distinctUntilKeyChanged('id_site'),
      filter(site => this.isSiteValid(site)),
      switchMap((site: Site) => {
        this.refreshing = true;
        return combineLatest([this.selectedProjectService.getSelectedProject(), this.projectService.getBySite(site.id_site)]);
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
      this.router.navigate([GlobalConstants.homePage]);
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
}
