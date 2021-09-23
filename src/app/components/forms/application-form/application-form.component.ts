import {ChangeDetectorRef, Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {Application} from '@shared/models/application.model';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ServiceService} from '@services/service.service';
import {SelectedProjectService} from '@services/selected-project.service';
import {Subscription} from 'rxjs';
import {Service} from '@shared/models/service.model';
import {switchMap} from 'rxjs/operators';
import {icons} from '@core/utils/icons';
import {Icon} from '@shared/models/icon.model';
import {GlobalConstants} from '@core/utils/global-constants';
import {Project} from '@shared/models/project.model';
import {ThemePalette} from '@angular/material/core';
import {validateAllFields} from '@core/utils/validate-form';

@Component({
  selector: 'app-application-form',
  templateUrl: './application-form.component.html',
  styleUrls: ['./application-form.component.scss']
})
export class ApplicationFormComponent implements OnInit, OnDestroy {
  title = '';
  appForm: FormGroup;
  services: Service[] = [];
  selectedService: Service;
  selectedIcon: Icon;
  icons = icons;
  showServiceControl = false;
  appType = GlobalConstants.applicationTypes;
  positions: number[] = [1, 2, 3, 4, 5, 6];
  required = GlobalConstants.requiredMessage;
  color: ThemePalette = 'primary';
  urlExample = 'www.example.com';
  canSave = false;
  private app: Application;
  private subscriptions: Subscription[] = [];
  private selectedProject: Project;

  constructor(public dialogRef: MatDialogRef<ApplicationFormComponent>,
              private fb: FormBuilder,
              private cdr: ChangeDetectorRef,
              private serviceService: ServiceService,
              private selectedProjectService: SelectedProjectService,
              @Inject(MAT_DIALOG_DATA) public data: Application) {
  }

  ngOnInit(): void {
    this.initializeForm();
    this.checkFormChange();
    this.app = this.data;
    if (this.app.id_app) {
      this.title = 'Informations de ' + this.app.app_name;
    } else {
      this.title = 'Nouvelle section';
    }
    this.getServices();
  }

  private checkFormChange(): void {
    this.subscriptions.push(
      this.appForm.valueChanges.subscribe(() => {
        this.canSave = !this.appForm.invalid;
      })
    );
  }

  private getServices(): void {
    this.subscriptions.push(
      this.selectedProjectService.getSelectedProject().pipe(
        switchMap((project) => {
          this.selectedProject = project;
          return this.serviceService.getByProject(project.id_project);
        })
      ).subscribe((services) => {
        this.services = services;
        this.setValues();
      })
    );
  }

  private initializeForm(): void {
    this.appForm = this.fb.group({
      name: new FormControl('', Validators.required),
      url: new FormControl(''),
      enable: new FormControl(true),
      icon: new FormControl('', Validators.required),
      order: new FormControl(this.positions[0], Validators.required),
      type: new FormControl(GlobalConstants.applicationTypes.external.toString(), Validators.required),
      service: new FormControl(''),
    });
  }

  private setValues(): void {
    this.appForm.controls.name.setValue(this.app.app_name);
    this.appForm.controls.order.setValue(this.app.app_order);
    this.appForm.controls.enable.setValue(this.app.app_enabled);
    this.setAppType();
    this.setSelectedIcon();
    if (!!this.app.service) {
      this.setSelectedService(this.app.service[0]);
    }
  }

  private setAppType(): void {
    if (this.app.app_type) {
      this.appForm.controls.type.setValue(this.app.app_type.toString());
      this.changeType(this.app.app_type);
    } else {
      this.appForm.controls.type.setValue(GlobalConstants.applicationTypes.external.toString());
    }
  }

  private setSelectedIcon(): void {
    const alreadySelected = this.icons.find(p => p.code === this.app.app_icon);
    if (alreadySelected) {
      this.selectedIcon = alreadySelected;
      this.appForm.controls.icon.setValue(alreadySelected);
    }
  }

  private setSelectedService(selectedService: Service): void {
    if (selectedService) {
      const alreadySelected = this.services.find(p => p.id_service === selectedService.id_service);
      if (alreadySelected) {
        this.selectedService = alreadySelected;
        this.appForm.controls.service.setValue(alreadySelected);
      }
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  iconChange(value: Icon): void {
    this.selectedIcon = value;
    this.data.app_icon = value.code;
  }

  changeType(value: any): void {
    this.showServiceControl = Number(value) === GlobalConstants.applicationTypes['OpenTera Service'];
    if (this.showServiceControl) {
      this.appForm.controls.service.setValidators([Validators.required]);
      this.urlExample = `ex.: https://${GlobalConstants.hostname}:${GlobalConstants.port}/rehab/`;
    } else {
      this.appForm.controls.service.clearValidators();
      this.urlExample = 'ex.: www.example.com';
    }
    this.appForm.controls.service.updateValueAndValidity();
  }

  private createApp(): void {
    const controls = this.appForm.controls;
    this.app.app_name = controls.name.value;
    this.app.app_enabled = controls.enable.value;
    this.app.app_icon = controls.icon.value.code;
    this.app.app_static_url = controls.url.value;
    this.app.app_order = controls.order.value;
    this.app.app_type = Number(controls.type.value);
    this.app.id_project = this.selectedProject.id_project;
    if (this.app.app_type === GlobalConstants.applicationTypes['OpenTera Service']) {
      this.app.app_service_key = controls.service.value.service_key;
    } else {
      this.app.app_service_key = '';
    }
  }

  onSave(): void {
    if (this.appForm.invalid) {
      validateAllFields(this.appForm);
      return;
    }
    if (this.canSave) {
      this.createApp();
      this.dialogRef.close(this.app);
    }
  }
}
