import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {ThemePalette} from '@angular/material/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {GlobalConstants} from '@core/utils/global-constants';
import {dateToISOLikeButLocal, roundToNearestQuarter} from '@core/utils/utility-functions';
import {CalendarService} from '@services/calendar.service';
import {Participant} from '@shared/models/participant.model';

@Component({
  selector: 'app-datetime-selector',
  templateUrl: './datetime-selector.component.html',
  styleUrls: ['./datetime-selector.component.scss']
})
export class DatetimeSelectorComponent implements OnInit, OnChanges {
  @ViewChild('picker', {static: true}) pickerFixed?: any;
  @Output() overlappingParticipants = new EventEmitter<string[]>();
  @Input() form: FormGroup;
  @Input() controlName: string;
  @Input() label: string;
  @Input() minDate: Date = null;
  @Input() default: Date = new Date();
  @Input() sessionParticipants: Participant[] = [];
  dateControl: any;
  stepMinute = 15;
  touchUi = true;
  color: ThemePalette = 'primary';
  showSeconds = false;
  required = GlobalConstants.requiredMessage;

  constructor(private calendarService: CalendarService) {
  }

  ngOnInit(): void {
    this.form.addControl(this.controlName, new FormControl(this.default, [Validators.required]));
    this.dateControl = this.form.controls[this.controlName];
    this.onTimeChange({value: this.default});
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.dateControl) {
      this.dateControl.setValue(this.default);
    }
  }

  onTimeChange(change: any): void {
    const control = this.form.controls;
    const newTime = new Date(change.value);
    this.updateEndTime(newTime);
    if (newTime !== new Date(this.dateControl.value)) {
      const startTime = new Date(control.startTime.value);
      let endTime = new Date(control.startTime.value);
      if (control.endTime !== undefined){
        endTime = new Date(control.endTime.value);
      }
      const isoStartDate = dateToISOLikeButLocal(startTime);
      const isoEndDate = dateToISOLikeButLocal(endTime);
      const participantsUUIDs: string[] = this.sessionParticipants.map((part) => part.participant_uuid);
      this.calendarService.checkOverlaps(isoStartDate, isoEndDate, participantsUUIDs).subscribe((overlappingEvents) => {
        let overlappingParticipants: string[] = [];
        overlappingEvents.forEach((event) => {
          overlappingParticipants = [...overlappingParticipants, ...event.session_participant_uuids];
        });
        this.overlappingParticipants.emit(overlappingParticipants);
      });
    }
  }

  private updateEndTime(newTime: Date): void {
    if (this.controlName === 'startTime') {
      const control = this.form.controls;
      if (control === undefined || control.endTime === undefined || control.startTime === undefined){
        return;
      }
      const startTime = roundToNearestQuarter(newTime);
      const endTime = roundToNearestQuarter(newTime);
      endTime.setHours(endTime.getHours() + 1);
      control.startTime.setValue(startTime);
      control.endTime.setValue(endTime);
    }
  }
}
