import {ChangeDetectionStrategy, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {Router} from '@angular/router';
import {Event} from '@shared/models/event.model';
import {CalendarEvent, CalendarView, collapseAnimation} from 'angular-calendar';
import {Subject, Subscription} from 'rxjs';
import {AccountService} from '@services/account.service';
import {Pages} from '@core/utils/pages';
import {isUser} from '@core/utils/utility-functions';
import {Account} from '@shared/models/account.model';
import {CalendarService} from '@services/calendar.service';
import {isSameDay, isSameMonth} from 'date-fns';

const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3',
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF',
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA',
  },
};

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [collapseAnimation]
})
export class CalendarComponent implements OnInit, OnChanges, OnDestroy {
  @Input() participantsUUIDs: string[] = [];
  events: Event[] = [];
  isUser = false;
  account: Account;
  activeDayIsOpen = false;
  eventsWithDetails: Event[] = [];
  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  viewDate: Date = new Date();
  refresh: Subject<any> = new Subject();
  calendarEvents: CalendarEvent[] = [];
  currentDate: Date;
  private subscriptions: Subscription[] = [];

  private static getPreviousMonday(date: Date): Date {
    const prevSunday = new Date(date);
    prevSunday.setDate(prevSunday.getDate() - prevSunday.getDay());
    return prevSunday;
  }

  private static daysInThisMonth(firstDay: Date | number | string): number {
    const date = new Date(firstDay);
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }

  private static getDateString(date: Date): string {
    const month = date.getMonth() + 1;
    const day = date.getDate().toString();
    return day + '-' + month + '-' + date.getFullYear();
  }

  private static createCalendarEvent(event: Event): CalendarEvent {
    return {
      title: `${event.event_name} (${event.user_uuid})`,
      start: new Date(event.event_start_datetime),
      end: new Date(event.event_end_datetime),
      color: event.session_uuid ? colors.session : colors.normal,
      draggable: false,
      resizable: {
        beforeStart: false,
        afterEnd: false,
      },
      meta: {event}
    };
  }

  constructor(private accountService: AccountService,
              private router: Router,
              private calendarService: CalendarService) {
    this.currentDate = new Date();
  }

  ngOnInit(): void {
    this.getAccount();
    this.getEvents();
  }

  private getAccount(): void {
    const account$ = this.accountService.account$();
    this.subscriptions.push(
      account$.subscribe((account) => {
        this.isUser = isUser(account);
        this.account = account;
        this.dateChange();
      })
    );
  }

  private getEvents(): void {
    const events$ = this.calendarService.events$();
    this.subscriptions.push(
      events$.subscribe((events) => {
        this.transformEventsForCalendar(events);
      })
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.dateChange();
  }

  private transformEventsForCalendar(eventsFromAPI: Event[]): void {
    const calendarData: CalendarEvent[] = [];
    eventsFromAPI.forEach(event => {
      calendarData.push(CalendarComponent.createCalendarEvent(event));
    });
    this.calendarEvents = calendarData;
    this.refresh.next();
  }

  dateChange(): void {
    switch (this.view) {
      case CalendarView.Day:
        this.getDayData(this.currentDate);
        break;
      case CalendarView.Week:
        this.getWeekData(this.currentDate);
        break;
      case CalendarView.Month:
        this.getMonthData(this.currentDate);
        break;
      default:
        break;
    }
  }

  private getDayData(firstDay: Date): void {
    this.refreshCalendar(firstDay, firstDay);
  }

  private getWeekData(firstDay: Date): void {
    const endDate = new Date(firstDay);
    endDate.setDate(endDate.getDate() + 6);
    this.refreshCalendar(firstDay, endDate);
  }

  private getMonthData(firstDay: Date): void {
    const numberOfDays = CalendarComponent.daysInThisMonth(firstDay);
    const startDate = new Date(firstDay);
    startDate.setDate(1);
    const endDate = new Date(firstDay);
    endDate.setDate(startDate.getDate() + (numberOfDays - 1));
    this.refreshCalendar(startDate, endDate);
  }

  dayClicked({date, events}: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      this.activeDayIsOpen = !((isSameDay(this.viewDate, date) && this.activeDayIsOpen) || events.length === 0);
      this.viewDate = date;
      this.eventsWithDetails = events.map(a => a.meta.event);
    }
  }

  closeOpenMonthViewDay(date: Date): void {
    this.activeDayIsOpen = false;
    switch (this.view) {
      case CalendarView.Day:
        this.currentDate = date;
        break;
      case CalendarView.Week:
        this.currentDate = CalendarComponent.getPreviousMonday(new Date(date));
        break;
      case CalendarView.Month:
        this.currentDate = new Date(date);
        break;
      default:
        break;
    }
    this.dateChange();
  }

  setView(view: CalendarView): void {
    this.view = view;
    this.dateChange();
  }

  private refreshCalendar(startDate: Date, endDate: Date): void {
    const start = CalendarComponent.getDateString(startDate);
    const end = CalendarComponent.getDateString(endDate);
    if (this.account) {
      if (this.isUser) {
        if (this.router.url.includes(Pages.planningPage)) {
          if (this.participantsUUIDs.length > 0) {
            // Get events for a participant
            this.calendarService.getCalendar(start, end, this.participantsUUIDs).subscribe();
          }
        } else {
          // Get events of the connected user
          this.calendarService.getCalendar(start, end).subscribe();
        }
      } else {
        // Get events of the connected participant
        this.participantsUUIDs = [this.account.login_uuid];
        this.calendarService.getCalendar(start, end, this.participantsUUIDs).subscribe();
      }
    }
  }

  openForm(event: CalendarEvent): void {
    if (this.isUser) {
      const idEvent = event.meta.event.id_event;
      this.router.navigate([Pages.eventFormPage, {idEvent}]);
    }
  }

  openFormWithTime(date: Date): void {
    if (this.isUser) {
      const time = date.toISOString();
      this.router.navigate([Pages.eventFormPage, {time}]);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
