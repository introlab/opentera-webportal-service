import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {AccountService} from '@services/account.service';
import {Account} from '@shared/models/account.model';
import {CalendarService} from '@services/calendar.service';
import {Event} from '@shared/models/event.model';
import {ActivatedRoute, Router} from '@angular/router';
import {isUser} from '@core/utils/utility-functions';
import {switchMap} from 'rxjs/operators';
import {Participant} from '@shared/models/participant.model';
import {SelectedParticipantService} from '@services/selected-participant.service';


@Component({
  selector: 'app-calendar-page',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']/*,
  changeDetection: ChangeDetectionStrategy.OnPush*/
})
export class CalendarPageComponent implements OnInit, OnDestroy {
  isUser = false;
  account: Account;
  nextEvents: Event[] = [];
  calendarName = '';
  participantsUUIDs: string[] = [];
  firstParticipantSelected = '';
  private subscriptions: Subscription[] = [];

  constructor(private accountService: AccountService,
              private router: Router,
              private calendarService: CalendarService,
              private selectedParticipantService: SelectedParticipantService,
              private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.getSelectedParticipant();
    this.getSessionData();
    this.subscribeCalendarEvents();
  }

  private subscribeCalendarEvents(): void{
    this.subscriptions.push(
      this.calendarService.events$().subscribe( events => {
        this.getNextThreeEvents().subscribe((three) => {
          this.nextEvents = three;
        });
      })
    );
  }

  private getSelectedParticipant(): void {
    this.subscriptions.push(
      this.selectedParticipantService.getSelectedParticipant().subscribe((selected) => {
        if (selected) {
          this.calendarName = selected.participant_name;
          this.firstParticipantSelected = selected.participant_uuid;
          // this.participantsUUIDs.push(selected.participant_uuid);
          this.participantsUUIDs = [selected.participant_uuid];
        }
      })
    );
  }

  private getSessionData(): void {
    const account$ = this.accountService.account$();

    this.subscriptions.push(
      account$.pipe(
        switchMap((account) => {
          this.account = account;
          this.calendarName = this.account.fullname;
          this.isUser = isUser(account);
          return this.getNextThreeEvents();
        })
      ).subscribe((three) => {
        this.nextEvents = three;
      })
    );
  }

  private getNextThreeEvents(): Observable<Event[]> {
    let participantsUUIDs: string[];
    if (!this.isUser) {
      participantsUUIDs = [this.account.login_uuid];
    } else {
      participantsUUIDs = this.participantsUUIDs;
    }
    return this.calendarService.getNextThree(participantsUUIDs);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  participantChange(participant: Participant): void {
    if (participant) {
      this.calendarName = participant.participant_name;
      this.participantsUUIDs = [participant.participant_uuid];
      this.selectedParticipantService.setSelectedParticipant(participant);
    } else {
      this.calendarName = this.account.fullname;
      this.participantsUUIDs = [];
      this.selectedParticipantService.setSelectedParticipant(null);
    }
    this.getNextThreeEvents().subscribe((three) => {
      this.nextEvents = three;
    });
  }
}
