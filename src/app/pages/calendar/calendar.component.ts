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


@Component({
  selector: 'app-calendar-page',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
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
              private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.getRouteParams();
    this.getSessionData();
  }

  private getRouteParams(): void {
    const uuid = this.route.snapshot.paramMap.get('uuid');
    const name = this.route.snapshot.paramMap.get('name');
    if (uuid) {
      this.firstParticipantSelected = uuid;
      this.participantsUUIDs.push(uuid);
    }
    if (name) {
      this.calendarName = name;
    }
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
    } else {
      this.calendarName = this.account.fullname;
      this.participantsUUIDs = [];
    }
    this.getNextThreeEvents().subscribe((three) => {
      this.nextEvents = three;
    });
  }
}
