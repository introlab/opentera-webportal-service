import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {GlobalConstants} from '@core/utils/global-constants';
import {ThemePalette} from '@angular/material/core';
import {combineLatest, Subscription} from 'rxjs';
import {Project} from '@shared/models/project.model';
import {Participant} from '@shared/models/participant.model';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {SelectedProjectService} from '@services/selected-project.service';
import {GroupService} from '@services/participant/group.service';
import {Group} from '@shared/models/group.model';
import {SelectedGroupService} from '@services/selected-group.service';
import {Application} from '@shared/models/application.model';
import {validateAllFields} from '@core/utils/validate-form';
import {createParticipantUrl} from '@core/utils/utility-functions';
import {ApplicationService} from '@services/application.service';
import {ApplicationConfig} from '@shared/models/application-config.model';
import {ParticipantService} from '@services/participant/participant.service';
import {Pages} from '@core/utils/pages';
import {NotificationService} from '@services/notification.service';
import {Router} from '@angular/router';
import {switchMap} from 'rxjs/operators';
import {ApplicationConfigService} from '@services/application-config.service';

@Component({
  selector: 'app-participant-form',
  templateUrl: './participant-form.component.html',
  styleUrls: ['./participant-form.component.scss']
})
export class ParticipantFormComponent implements OnInit, OnDestroy {
  title = '';
  participantForm: FormGroup;
  required = GlobalConstants.requiredMessage;
  color: ThemePalette = 'primary';
  groups: Group[] = [];
  canSave = false;
  appConfigs: ApplicationConfig[] = [];
  private participant: Participant;
  private selectedProject: Project;
  private selectedGroup: Group;
  private subscriptions: Subscription[] = [];
  private applications: Application[] = [];

  constructor(public dialogRef: MatDialogRef<ParticipantFormComponent>,
              private fb: FormBuilder,
              private groupService: GroupService,
              private selectedGroupService: SelectedGroupService,
              private selectedProjectService: SelectedProjectService,
              private applicationService: ApplicationService,
              private participantService: ParticipantService,
              private notificationService: NotificationService,
              private appConfigsService: ApplicationConfigService,
              private router: Router,
              @Inject(MAT_DIALOG_DATA) public data: Participant) {
  }

  ngOnInit(): void {
    this.initializeForm();
    this.checkFormChange();
    this.participant = this.data;
    if (this.participant.id_participant) {
      this.title = 'Informations de ' + this.participant.participant_name;
    } else {
      this.title = 'Nouveau participant';
    }
    this.getServices();
    this.canSave = false;
  }

  private checkFormChange(): void {
    this.subscriptions.push(
      this.participantForm.valueChanges.subscribe(() => {
        this.canSave = !this.participantForm.invalid;
      })
    );
  }

  private getServices(): void {
    const group$ = this.selectedGroupService.getSelectedGroup();
    const project$ = this.selectedProjectService.getSelectedProject();
    const applications$ = this.applicationService.applications$();
    const appConfigs$ = this.appConfigsService.getByParticipant(this.participant.participant_uuid);

    this.subscriptions.push(
      combineLatest([project$, group$, applications$, appConfigs$]).subscribe(([project, group, applications, appConfigs]) => {
        this.selectedProject = project;
        this.selectedGroup = group;
        this.applications = applications;
        this.appConfigs = appConfigs;
        this.setValues();
      })
    );
  }

  private initializeForm(): void {
    this.participantForm = this.fb.group({
      name: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.email]),
      connectionUrl: new FormControl({value: '', disabled: true}),
      enable: new FormControl(true),
    });
  }

  private setValues(): void {
    this.participantForm.controls.name.setValue(this.participant.participant_name);
    this.participantForm.controls.enable.setValue(this.participant.participant_enabled);
    this.participantForm.controls.email.setValue(this.participant.participant_email);
    this.participantForm.controls.connectionUrl.setValue(createParticipantUrl(this.participant.participant_token));
  }

  validate(): void {
    if (this.participantForm.invalid) {
      validateAllFields(this.participantForm);
      return;
    }
    if (this.canSave) {
      const participant = this.createParticipant();
      this.save(participant);
      this.dialogRef.close(participant);
    }
  }

  private createParticipant(): Participant {
    const controls = this.participantForm.controls;
    const temp = new Participant();
    temp.participant_token_enabled = controls.enable.value;
    temp.participant_enabled = controls.enable.value;
    if (controls.name.value.toLocaleLowerCase() !== this.participant.participant_name?.toLocaleLowerCase()) {
      temp.participant_name = controls.name.value;
    }
    if (controls.email.value && controls.email.value.toLocaleLowerCase() !== this.participant.participant_email?.toLocaleLowerCase()) {
      temp.participant_email = controls.email.value;
    }
    temp.id_project = this.selectedProject.id_project;
    temp.id_participant_group = this.selectedGroup.id_participant_group;
    temp.id_participant = this.participant.id_participant;
    return temp;
  }

  private save(participant: Participant): void {
    this.participantService.update(participant).pipe(switchMap((updated) => {
      this.router.navigate([Pages.createPath(Pages.participantsPage, true)]);
      this.notificationService.showSuccess('Le participant ' + updated[0].participant_name + ' a été sauvegardé.');
      const appConfigs = this.createAppConfig(updated[0].participant_uuid);
      return this.appConfigsService.update(appConfigs);
    })).subscribe();
  }

  private createAppConfig(participantUUID: string): ApplicationConfig[] {
    const controls = this.participantForm.controls;
    const configs: ApplicationConfig[] = [];
    this.applications.forEach((app) => {
      const config = new ApplicationConfig();
      config.id_app = app.id_app;
      config.participant_uuid = participantUUID;
      config.app_config_url = controls['app_' + app.app_name].value;
      configs.push(config);
    });
    return configs;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

}
