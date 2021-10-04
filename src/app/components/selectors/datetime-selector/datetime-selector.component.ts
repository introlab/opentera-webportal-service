import {Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {ThemePalette} from '@angular/material/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {GlobalConstants} from '@core/utils/global-constants';

@Component({
  selector: 'app-datetime-selector',
  templateUrl: './datetime-selector.component.html',
  styleUrls: ['./datetime-selector.component.scss']
})
export class DatetimeSelectorComponent implements OnInit, OnChanges {
  @ViewChild('picker', {static: true}) pickerFixed?: any;
  @Input() form: FormGroup;
  @Input() controlName: string;
  @Input() label: string;
  @Input() minDate: Date = null;
  @Input() default: Date = new Date();
  dateControl: any;
  stepMinute = 15;
  touchUi = true;
  color: ThemePalette = 'primary';
  showSeconds = false;
  required = GlobalConstants.requiredMessage;

  constructor() {
  }

  ngOnInit(): void {
    this.form.addControl(this.controlName, new FormControl(this.default, [Validators.required]));
    this.dateControl = this.form.controls[this.controlName];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.dateControl) {
      this.dateControl.setValue(this.default);
    }
  }
}
