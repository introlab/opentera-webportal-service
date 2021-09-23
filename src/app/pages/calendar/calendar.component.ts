import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {collapseAnimation} from 'angular-calendar';
import {AccountService} from '@services/account.service';
import {Account} from '@shared/models/account.model';
import {CalendarService} from '@services/calendar.service';
import {Event} from '@shared/models/event.model';
import {Router} from '@angular/router';
import {isUser} from '@core/utils/utility-functions';
import {filter, switchMap} from 'rxjs/operators';


@Component({
  selector: 'app-calendar-page',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [collapseAnimation]
})
export class CalendarPageComponent implements OnInit, OnDestroy {
  isUser = false;
  account: Account;
  nextEvents: Event[] = [];
  private subscriptions: Subscription[] = [];

  constructor(private accountService: AccountService,
              private router: Router,
              private calendarService: CalendarService) {
  }

  ngOnInit(): void {
    this.getSessionData();
  }

  private getSessionData(): void {
    const account$ = this.accountService.account$();

    this.subscriptions.push(
      account$.pipe(
        filter((account) => !!account.login_uuid),
        switchMap((account) => {
          this.account = account;
          this.isUser = isUser(account);
          return this.getNextThreeEvents();
        })
      ).subscribe((three) => {
        this.nextEvents = three;
      })
    );
  }

  private getNextThreeEvents(): Observable<Event[]> {
    let participantsUUIDs: string[] = [];
    if (!this.isUser) {
      participantsUUIDs = [this.account.login_uuid];
    }
    return this.calendarService.getNextThree(participantsUUIDs);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
