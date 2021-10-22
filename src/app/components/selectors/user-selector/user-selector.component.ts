import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {UserService} from '@services/user.service';
import {combineLatest, Observable, Subscription} from 'rxjs';
import {User} from '@shared/models/user.model';
import {filter, switchMap} from 'rxjs/operators';
import {SelectedProjectService} from '@services/selected-project.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {PermissionsService} from '@services/permissions.service';
import {Permission} from '@shared/models/permission.model';
import {Project} from '@shared/models/project.model';
import {GlobalConstants} from '@core/utils/global-constants';

@Component({
  selector: 'app-user-selector',
  templateUrl: './user-selector.component.html',
  styleUrls: ['./user-selector.component.scss']
})
export class UserSelectorComponent implements OnInit, OnChanges, OnDestroy {
  @Input() selectedUserUUID: string;
  @Input() form: FormGroup;
  users: User[] = [];
  selectedUser: User;
  required = GlobalConstants.requiredMessage;
  private subscriptions: Subscription[] = [];

  constructor(private userService: UserService,
              private permissionsService: PermissionsService,
              private selectedProjectService: SelectedProjectService) {
  }

  ngOnInit(): void {
    this.form.addControl('clinician', new FormControl('', [Validators.required]));
    this.getUsers();
    this.subscriptions.push(
      combineLatest([this.getPermissions(), this.getSelectedProject()]).pipe(
        switchMap(([permissions, project]) => {
          if (!permissions.project_admin) {
            this.form.controls.clinician.disable();
          }
          return this.refreshUsers(project.id_project);
        })
      ).subscribe()
    );
  }

  private getPermissions(): Observable<Permission> {
    return this.permissionsService.permissions$();
  }

  private getUsers(): void {
    this.userService.users$().subscribe((users) => {
      this.users = users;
      console.log(users);
      this.selectUser();
    });
  }

  private getSelectedProject(): Observable<Project> {
    return this.selectedProjectService.getSelectedProject();
  }

  private refreshUsers(idProject: number): Observable<User[]> {
    return this.userService.getByProject(idProject);
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
    this.selectUser();
  }

  private selectUser(): void {
    const alreadySelected = this.users.find(p => p.user_uuid === this.selectedUserUUID);
    if (alreadySelected) {
      this.form.controls.clinician.setValue(alreadySelected);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

}
