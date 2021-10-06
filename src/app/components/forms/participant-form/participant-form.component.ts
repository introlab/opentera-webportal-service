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
  canSave = false;
  private participant: Participant;
  private selectedProject: Project;
  private selectedGroup: Group;
  private subscriptions: Subscription[] = [];

  constructor(public dialogRef: MatDialogRef<ParticipantFormComponent>,
              private fb: FormBuilder,
              private groupService: GroupService,
              private selectedGroupService: SelectedGroupService,
              private selectedProjectService: SelectedProjectService,
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

    this.subscriptions.push(
      combineLatest([project$, group$]).subscribe(([project, group]) => {
        this.selectedProject = project;
        this.selectedGroup = group;
        this.setValues();
      })
    );
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
    const temp = new Participant();
    temp.participant_enabled = true;
    temp.participant_token_enabled = true;
    temp.participant_enabled = controls.enable.value;
    if (controls.name.value.toLocaleLowerCase() !== this.participant.participant_name.toLocaleLowerCase()) {
      temp.participant_name = controls.name.value;
    }
    if (controls.email.value.toLocaleLowerCase() !== this.participant.participant_email.toLocaleLowerCase()) {
      temp.participant_name = controls.name.value;
    }
    temp.id_project = this.selectedProject.id_project;
    temp.id_participant_group = this.selectedGroup.id_participant_group;
    this.participant.id_participant ? temp.id_participant = this.participant.id_participant : temp.id_participant = 0;
  }

  validate(): void {
    if (this.participantForm.invalid) {
      validateAllFields(this.participantForm);
      return;
    }
    if (this.canSave) {
      this.createParticipant();
      this.dialogRef.close(this.participant);
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

}
