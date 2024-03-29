import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Event} from '@shared/models/event.model';
import {CalendarService} from '@services/calendar.service';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {NotificationService} from '@services/notification.service';
import {TimeInputValidator} from '@core/validators/time-input.validator';
import {AccountService} from '@services/account.service';
import {Account} from '@shared/models/account.model';
import {dateToISOLikeButLocal, getDuration, isObjectEmpty, roundToNearestQuarter} from '@core/utils/utility-functions';
import {Session} from '@shared/models/session.model';
import {ActivatedRoute, Router} from '@angular/router';
import {validateAllFields} from '@core/utils/validate-form';
import {Participant} from '@shared/models/participant.model';
import {GlobalConstants} from '@core/utils/global-constants';
import {combineLatest, EMPTY, Subscription} from 'rxjs';
import {switchMap, tap} from 'rxjs/operators';
import {Pages} from '@core/utils/pages';
import {SessionType} from '@shared/models/session-type.model';
import {SelectedParticipantsComponent} from '@components/selected-participants/selected-participants.component';

@Component({
  selector: 'app-event-form',
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.scss']
})
export class EventFormComponent implements OnInit, OnDestroy, AfterViewInit {
  event: Event;
  eventForm: FormGroup;
  title: string;
  canSave = false;
  session: Session;
  hasSession = false;
  sessionParticipants: Participant[] = [];
  required = GlobalConstants.requiredMessage;
  startTimeControlName = 'startTime';
  endTimeControlName = 'endTime';
  startTime: Date;
  endTime: Date;
  today = new Date();
  overlappingParticipants: string[] = [];
  selectedUserUUID = '';
  selectedParticipantUUID = '';
  serviceSessionType = true;
  private account: Account;
  private subscriptions: Subscription[] = [];
  @ViewChild(SelectedParticipantsComponent) participantSelector: SelectedParticipantsComponent;

  constructor(private calendarService: CalendarService,
              private notificationService: NotificationService,
              private accountService: AccountService,
              private fb: FormBuilder,
              private router: Router,
              private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.setNewTime(this.today);
    this.initializeForm();
    this.checkFormChange();
    this.getData();
    this.title = 'Nouvelle entrée au calendrier';
    this.canSave = false;
  }

  private getData(): void {
    const account$ = this.accountService.account$();
    const routeParam$ = this.route.params;

    combineLatest([account$, routeParam$]).pipe(
      tap(([account, params]) => {
        if (params.participantsUUIDs) {
          this.selectedParticipantUUID = params.participantsUUIDs;
        }
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
          this.selectedUserUUID = this.account.login_uuid;
          this.setUpAsyncValidators();
          return EMPTY;
        }
      })
    ).subscribe((event) => {
      if (event.length > 0) {
        this.event = event[0];
        this.setValues();
      }
      this.setUpAsyncValidators();
    });
  }

  private initializeForm(): void {
    this.eventForm = this.fb.group({
      name: new FormControl('', Validators.required),
      url: new FormControl('')
    }, {
      validators: TimeInputValidator.validateTimes,
      updateOn: 'blur',
    });
    this.eventForm.markAllAsTouched();
  }

  private setUpAsyncValidators(): void {
    this.eventForm.setAsyncValidators([TimeInputValidator.checkIfTimeSlotsTaken(this.calendarService, this.event.id_event, this.account)]);
    this.eventForm.updateValueAndValidity();
  }

  private checkFormChange(): void {
    this.subscriptions.push(
      this.eventForm.valueChanges.subscribe((val) => {
        this.enableSave();
      })
    );
  }

  private setValues(): void {
    const controls = this.eventForm.controls;
    controls.name.setValue(this.event.event_name);
    this.startTime = new Date(this.event.event_start_datetime);
    this.endTime = new Date(this.event.event_end_datetime);
    controls.url.setValue(this.event.event_static_url);
    this.selectedUserUUID = this.event.user_uuid;
    if (this.event.session) {
      this.hasSession = true;
      this.session = this.event.session[0];
      this.title = this.session.session_name;
      this.sessionParticipants = this.session.session_participants;
    }
  }

  private setNewTime(time: Date): void {
    this.startTime = roundToNearestQuarter(time);
    this.endTime = roundToNearestQuarter(time);
    let start_hour = this.startTime.getHours();
    if (time.getDate() === this.today.getDate()){
      const current_time = new Date();
      start_hour = current_time.getHours() + 1;
    }else{
      start_hour = start_hour + 9; // Default start time for each day is 9am
    }

    this.startTime.setHours(start_hour);
    this.endTime.setHours(start_hour + 1);
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
    const inPast = this.eventForm.controls.startTime && this.eventForm.controls.startTime.value < this.today;
    this.canSave = !(this.eventForm.invalid || this.hasNoParticipant() || inPast);
  }

  hasNoParticipant(): boolean {
    return this.sessionParticipants.length === 0;
  }

  private createEvent(): void {
    const controls = this.eventForm.controls;
    const startTime = controls.startTime.value;
    const endTime = controls.endTime.value;
    this.event.event_name = controls.name.value;
    this.event.event_start_datetime = dateToISOLikeButLocal(startTime);
    this.event.event_end_datetime = dateToISOLikeButLocal(endTime);
    this.event.event_static_url = controls.url.value;
    this.event.session = this.createSession();
    this.event.session.session_start_datetime = this.event.event_start_datetime;
    this.event.session.session_duration = getDuration(startTime, endTime);
    this.event.session_participant_uuids = this.sessionParticipants.map(a => a.participant_uuid);
    this.event.user_uuid = controls.clinician.value.user_uuid;
  }

  private createSession(): Session {
    const controls = this.eventForm.controls;
    const session = new Session();
    session.session_name = controls.name.value;
    session.id_session = !isObjectEmpty(this.session) ? this.session.id_session : 0;
    session.session_users_uuids = [controls.clinician.value.user_uuid];
    session.id_creator_user = controls.clinician.value.id_user;
    session.session_status = 0;
    session.id_session_type = controls.type.value.id_session_type;
    session.session_participants_uuids = this.sessionParticipants.map(a => a.participant_uuid);
    return session;
  }

  private saveEvent(): void {
    this.calendarService.update(this.event).subscribe((result) => {
      this.router.navigate([Pages.calendarPage]);
      this.notificationService.showSuccess(`L'évenement ${this.event.event_name} a été sauvegardé.`);
    });
  }

  cancel(): void {
    this.router.navigate([Pages.calendarPage]);
  }

  participantsChange(participants: Participant[]): void {
    this.sessionParticipants = participants;
    this.enableSave();
    const control = this.eventForm.controls;
    const startTime = new Date(control.startTime.value);
    const endTime = new Date(control.endTime.value);
    const isoStartDate = dateToISOLikeButLocal(startTime);
    const isoEndDate = dateToISOLikeButLocal(endTime);
    const participantsUUIDs: string[] = this.sessionParticipants.map((part) => part.participant_uuid);
    this.calendarService.checkOverlaps(isoStartDate, isoEndDate, participantsUUIDs, '', this.event.id_event).subscribe((res) => {
      this.overlappingParticipants = [];
      res.forEach((event) => {
        this.overlappingParticipants = [...this.overlappingParticipants, ...event.session_participant_uuids];
      });
    });
  }

  sessionTypeChange(sessionType: SessionType): void {
    this.serviceSessionType = (sessionType.session_type_service_key !== undefined);
    console.log(sessionType.session_type_service_key);
  }

  overlappingParticipantsChange(UUIDs: string[]): void {
    this.overlappingParticipants = UUIDs;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  ngAfterViewInit(): void {
    if (this.selectedParticipantUUID.length > 0){
      this.participantSelector.selectParticipantByUuid(this.selectedParticipantUUID);
    }
  }
}
