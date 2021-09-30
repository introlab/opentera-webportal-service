import {Component, OnDestroy, OnInit} from '@angular/core';
import {Event} from '@shared/models/event.model';
import {Location} from '@angular/common';
import {CalendarService} from '@services/calendar.service';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {NotificationService} from '@services/notification.service';
import {TimeInputValidator} from '@core/validators/time-input.validator';
import {AccountService} from '@services/account.service';
import {Account} from '@shared/models/account.model';
import {dateToISOLikeButLocal, getDuration, isObjectEmpty, setDate} from '@core/utils/utility-functions';
import {Session} from '@shared/models/session.model';
import {ActivatedRoute, Router} from '@angular/router';
import {validateAllFields} from '@core/utils/validate-form';
import {Participant} from '@shared/models/participant.model';
import {GlobalConstants} from '@core/utils/global-constants';
import {combineLatest, EMPTY, Subscription} from 'rxjs';
import {switchMap, tap} from 'rxjs/operators';

@Component({
  selector: 'app-event-form',
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.scss']
})
export class EventFormComponent implements OnInit, OnDestroy {
  event: Event;
  eventForm: FormGroup;
  title: string;
  canSave = false;
  session: Session;
  hasSession = false;
  sessionParticipants: Participant[] = [];
  required = GlobalConstants.requiredMessage;
  private account: Account;
  private subscriptions: Subscription[] = [];

  private static roundToNearestQuarter(date: Date): Date {
    const coefficient = 1000 * 60 * 15;
    return new Date(Math.round(date.getTime() / coefficient) * coefficient);
  }

  constructor(private calendarService: CalendarService,
              private notificationService: NotificationService,
              private accountService: AccountService,
              private fb: FormBuilder,
              private router: Router,
              private location: Location,
              private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.initializeForm();
    this.getData();
    this.title = 'Nouvelle entrée au calendrier';
    this.canSave = false;
  }

  private getData(): void {
    const account$ = this.accountService.account$();
    const routeParam$ = this.route.params;

    combineLatest([account$, routeParam$]).pipe(
      tap(([account, params]) => {
        if (params.time) {
          const date = new Date(params.time);
          this.setNewTime(date);
        }
      }),
      switchMap(([account, params]) => {
        this.account = account;
        if (params.idEvent) {
          return this.calendarService.getFromId(params.idEvent);
        } else {
          this.event = new Event();
          this.event.id_event = 0;
          this.event.user_uuid = this.account.login_uuid;
          this.eventForm.controls.clinician.setValue(this.account.fullname);
          this.setUpValidators();
          return EMPTY;
        }
      })
    ).subscribe((event) => {
      if (event.length > 0) {
        this.event = event[0];
        this.setValues();
      }
      this.setUpValidators();
    });
  }

  private initializeForm(): void {
    const today = EventFormComponent.roundToNearestQuarter(new Date());
    const inOneHour = EventFormComponent.roundToNearestQuarter(new Date());
    inOneHour.setHours(inOneHour.getHours() + 1);
    this.eventForm = this.fb.group({
      name: new FormControl('', Validators.required),
      clinician: new FormControl({value: '', disabled: true}, Validators.required),
      startDate: new FormControl(today, Validators.required),
      startTime: new FormControl(today, Validators.required),
      endTime: new FormControl(inOneHour, Validators.required)
    }, {
      validators: TimeInputValidator.validateTimes,
      updateOn: 'blur'
    });
  }

  private setUpValidators(): void {
    this.onChanges();
    this.eventForm.setAsyncValidators([TimeInputValidator.checkIfTimeSlotsTaken(
      this.calendarService, this.event.user_uuid, this.event.id_event, this.sessionParticipants)]);
    this.eventForm.updateValueAndValidity();
  }

  private onChanges(): void {
    this.subscriptions.push(
      this.eventForm.valueChanges.subscribe((val) => {
        this.enableSave();
      })
    );
  }

  private setValues(): void {
    const controls = this.eventForm.controls;
    controls.name.setValue(this.event.event_name);
    controls.startDate.setValue(new Date(this.event.event_start_datetime));
    controls.startTime.setValue(new Date(this.event.event_start_datetime));
    controls.endTime.setValue(new Date(this.event.event_end_datetime));
    controls.clinician.setValue(this.event.user_fullname);
    if (this.event.session) {
      this.hasSession = true;
      this.session = this.event.session[0];
      this.title = this.session.session_name;
      this.sessionParticipants = this.session.session_participants;
    }
  }

  private setNewTime(time: Date): void {
    const start = EventFormComponent.roundToNearestQuarter(time);
    const inOneHour = EventFormComponent.roundToNearestQuarter(time);
    inOneHour.setHours(inOneHour.getHours() + 1);
    this.eventForm.controls.startDate.setValue(start);
    this.eventForm.controls.startTime.setValue(start);
    this.eventForm.controls.endTime.setValue(inOneHour);
  }

  validate(): void {
    if (this.eventForm.invalid) {
      validateAllFields(this.eventForm);
      return;
    }
    if (this.canSave) {
      this.createEvent();
      this.saveEvent();
    }
  }

  enableSave(): void {
    this.canSave = !(this.eventForm.invalid || this.hasNoParticipant());
  }

  hasNoParticipant(): boolean {
    return this.sessionParticipants.length === 0;
  }

  private createEvent(): void {
    const date = this.eventForm.controls.startDate.value;
    const start = this.eventForm.controls.startTime.value;
    const end = this.eventForm.controls.endTime.value;
    this.event.event_name = this.eventForm.controls.name.value;
    this.event.event_start_datetime = dateToISOLikeButLocal(setDate(date, start));
    this.event.event_end_datetime = dateToISOLikeButLocal(setDate(date, end));
    this.event.session = this.createSession();
    this.event.session.session_start_datetime = this.event.event_start_datetime;
    this.event.session.session_duration = getDuration(start, end);
    this.event.session_participant_uuids = this.sessionParticipants.map(a => a.participant_uuid);
  }

  private createSession(): Session {
    const session = new Session();
    session.session_name = this.eventForm.controls.name.value;
    session.id_session = !isObjectEmpty(this.session) ? this.session.id_session : 0;
    session.session_users_uuids = [this.account.login_uuid];
    session.session_status = 0;
    session.id_session_type = this.eventForm.controls.type.value.id_session_type;
    session.session_participants_uuids = this.sessionParticipants.map(a => a.participant_uuid);
    return session;
  }

  private saveEvent(): void {
    this.calendarService.update(this.event).subscribe((result) => {
      this.location.back();
      this.notificationService.showSuccess(`L'évenement ${this.event.event_name} a été sauvegardé.`);
    });
  }

  cancel(): void {
    this.location.back();
  }

  participantsChange(participants: Participant[]): void {
    this.sessionParticipants = participants;
    this.enableSave();
    const control = this.eventForm.controls;
    const startTime = new Date(control.startTime.value);
    const endTime = new Date(control.endTime.value);
    const date = new Date(control.startDate.value);
    const isoStartDate = dateToISOLikeButLocal(setDate(date, startTime));
    const isoEndDate = dateToISOLikeButLocal(setDate(date, endTime));
    const participantsUUIDs: string[] = this.sessionParticipants.map((part) => part.participant_uuid);
    this.calendarService.checkOverlaps(isoStartDate, isoEndDate, participantsUUIDs).subscribe((res) => {
      console.log('overlaps participant', res);
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
