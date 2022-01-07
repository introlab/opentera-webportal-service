import {Component, OnDestroy, OnInit, Input, OnChanges, Output, EventEmitter} from '@angular/core';
import {SessionType} from '@shared/models/session-type.model';
import {SelectedProjectService} from '@services/selected-project.service';
import {Subscription} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {SessionTypeService} from '@services/session-type.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {GlobalConstants} from '@core/utils/global-constants';

@Component({
  selector: 'app-session-type-selector',
  templateUrl: './session-type-selector.component.html',
  styleUrls: ['./session-type-selector.component.scss']
})
export class SessionTypeSelectorComponent implements OnInit, OnChanges, OnDestroy {
  @Input() idEventSessionType: number;
  @Input() form: FormGroup;
  @Output() sessionTypeChange = new EventEmitter();
  types: SessionType[] = [];
  selectedType: SessionType;
  required = GlobalConstants.requiredMessage;
  private subscription: Subscription;

  constructor(private selectedProjectService: SelectedProjectService,
              private sessionService: SessionTypeService) {
  }

  ngOnInit(): void {
    this.form.addControl('type', new FormControl('', [Validators.required]));
    this.getTypes();
    this.form.markAllAsTouched();
  }

  ngOnChanges(): void {
    this.selectType();
  }

  private getTypes(): void {
    this.subscription = this.selectedProjectService.getSelectedProject().pipe(
      switchMap((project) => {
        return this.sessionService.getByProject(project.id_project);
      })
    ).subscribe((types) => {
      this.types = types;
      this.selectType();
    });
  }

  private selectType(): void {
    const alreadySelected = this.types.find(p => p.id_session_type === this.idEventSessionType);
    if (alreadySelected) {
      this.form.controls.type.setValue(alreadySelected);
      this.sessionTypeChange.emit(alreadySelected);
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onValueChanged(value: SessionType): void {
    this.sessionTypeChange.emit(value);
  }
}
