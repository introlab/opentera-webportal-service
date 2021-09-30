import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {GlobalConstants} from '@core/utils/global-constants';
import {ThemePalette} from '@angular/material/core';
import {combineLatest, Subscription} from 'rxjs';
import {Project} from '@shared/models/project.model';
import {Participant} from '@shared/models/participant.model';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {SelectedProjectService} from '@services/selected-project.service';
import {switchMap} from 'rxjs/operators';
import {GroupService} from '@services/participant/group.service';
import {Group} from '@shared/models/group.model';
import {SelectedGroupService} from '@services/selected-group.service';
import {Application} from '@shared/models/application.model';

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
  participantApps: Application[] = [];
  private participant: Participant;
  private subscription: Subscription;
  private selectedProject: Project;
  private selectedGroup: Group;

  constructor(public dialogRef: MatDialogRef<ParticipantFormComponent>,
              private fb: FormBuilder,
              private groupService: GroupService,
              private selectedGroupService: SelectedGroupService,
              private selectedProjectService: SelectedProjectService,
              @Inject(MAT_DIALOG_DATA) public data: Participant) {
  }

  ngOnInit(): void {
    this.initializeForm();
    this.participant = this.data;
    if (this.participant.id_participant) {
      this.title = 'Informations de ' + this.participant.participant_name;
    } else {
      this.title = 'Nouveau participant';
    }
    this.getServices();
  }

  private getServices(): void {
    const group$ = this.selectedGroupService.getSelectedGroup();
    const project$ = this.selectedProjectService.getSelectedProject();

    this.subscription = combineLatest([project$, group$]).subscribe(([project, group]) => {
      this.selectedProject = project;
      this.selectedGroup = group;
      this.setValues();
    });
  }

  private initializeForm(): void {
    this.participantForm = this.fb.group({
      name: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      url: new FormControl(''),
      enable: new FormControl(true),
    });
  }

  private setValues(): void {
    this.participantForm.controls.name.setValue(this.participant.participant_name);
    this.participantForm.controls.enable.setValue(this.participant.participant_enabled);
    this.participantForm.controls.email.setValue(this.participant.participant_email);
  }

  private createParticipant(): void {
    const controls = this.participantForm.controls;
    this.participant.participant_token_enabled = true;
    this.participant.participant_name = controls.name.value;
    this.participant.participant_email = controls.email.value;
    this.participant.participant_enabled = controls.enable.value;
    this.participant.id_project = this.selectedProject.id_project;
    this.participant.id_participant_group = this.selectedGroup.id_participant_group;
  }

  onSave(): void {
    this.createParticipant();
    this.dialogRef.close(this.participant);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
