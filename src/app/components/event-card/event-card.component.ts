import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ConfirmationComponent} from '@components/confirmation/confirmation.component';
import {Event} from '@shared/models/event.model';
import {CalendarService} from '@services/calendar.service';
import {NotificationService} from '@services/notification.service';
import {MatDialog} from '@angular/material/dialog';
import {convertMinutesToHoursMinutes, getDuration, isUser} from '@core/utils/utility-functions';
import {Router} from '@angular/router';
import {GlobalConstants} from '@core/utils/global-constants';
import {AccountService} from '@services/account.service';
import {Subscription} from 'rxjs';
import {Account} from '@shared/models/account.model';

@Component({
  selector: 'app-event-card',
  templateUrl: './event-card.component.html',
  styleUrls: ['./event-card.component.scss']
})
export class EventCardComponent implements OnInit, OnDestroy {
  @Input() event: Event;
  duration: string;
  isUser = false;
  isEventToCome = false;
  private subscription: Subscription;
  private account: Account;

  constructor(private calendarService: CalendarService,
              private router: Router,
              private accountService: AccountService,
              private notificationService: NotificationService,
              public dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.getDuration();
    this.subscription = this.accountService.account$().subscribe((account) => {
      this.account = account;
      this.isUser = isUser(account);
    });
  }

  private getDuration(): void {
    const today = new Date();
    const start = new Date(this.event.event_start_datetime);
    const end = new Date(this.event.event_end_datetime);
    const duration = getDuration(start, end);
    this.isEventToCome = end >= today;
    this.duration = convertMinutesToHoursMinutes(duration);
  }

  confirmDeletion(idToDelete: number): void {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      width: '350px',
      data: 'Êtes-vous sûr de vouloir supprimer cette séance du calendrier?'
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.deleteEvent(idToDelete);
      }
    });
  }

  deleteEvent(idToDelete: number): void {
    this.calendarService.delete(idToDelete).subscribe(() => {
      this.notificationService.showSuccess('La séance ' + idToDelete + ' a été supprimée.');
    }, (err) => {
      console.error('Ce compte ne possède pas les permissions pour supprimer cette séance.', err);
      this.notificationService.showError('Ce compte ne possède pas les permissions pour supprimer cette séance.');
    });
  }

  connect(event_static_url: string): void {
    console.log(event_static_url);
  }

  openForm(idEvent: number): void {
    this.router.navigate([GlobalConstants.eventFormPage, {idEvent}]);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
