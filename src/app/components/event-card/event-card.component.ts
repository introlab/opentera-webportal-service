import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ConfirmationComponent} from '@components/confirmation/confirmation.component';
import {Event} from '@shared/models/event.model';
import {CalendarService} from '@services/calendar.service';
import {NotificationService} from '@services/notification.service';
import {MatDialog} from '@angular/material/dialog';
import {convertMinutesToHoursMinutes, getDuration, isUser} from '@core/utils/utility-functions';
import {Router} from '@angular/router';
import {Pages} from '@core/utils/pages';
import {AccountService} from '@services/account.service';
import {Subscription} from 'rxjs';
import {Account} from '@shared/models/account.model';
import {SelectedSourceService} from '@services/selected-source.service';

@Component({
  selector: 'app-event-card',
  templateUrl: './event-card.component.html',
  styleUrls: ['./event-card.component.scss']
})
export class EventCardComponent implements OnInit, OnDestroy {
  @Input() event: Event;
  duration: string;
  isUser = false;
  isLive = false;
  isPastEvent = true;
  private subscription: Subscription;
  private account: Account;

  constructor(private calendarService: CalendarService,
              private router: Router,
              private accountService: AccountService,
              private selectedSourceService: SelectedSourceService,
              private notificationService: NotificationService,
              public dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.checkIfEventIsLive();
    this.checkIfEventIsPassed();
    this.getDuration();
    this.subscription = this.accountService.account$().subscribe((account) => {
      this.account = account;
      this.isUser = isUser(account);
    });
  }

  private checkIfEventIsLive(): void {
    const now = new Date();
    const start = new Date(this.event.event_start_datetime);
    const end = new Date(this.event.event_end_datetime);
    this.isLive = start <= now && now < end;
  }

  private checkIfEventIsPassed(): void {
    const now = new Date();
    const end = new Date(this.event.event_end_datetime);
    this.isPastEvent = end < now;
  }

  private getDuration(): void {
    const start = new Date(this.event.event_start_datetime);
    const end = new Date(this.event.event_end_datetime);
    const duration = getDuration(start, end);
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

  connect(): void {
    if (!this.isUser) {
      const videoRehabApp = this.account.apps.find((app) => app.app_service_key === 'VideoRehabService');
      if (videoRehabApp && videoRehabApp.app_config) {
        this.selectedSourceService.setSelectedSource(videoRehabApp.app_config.app_config_url);
        const app = videoRehabApp.app_name?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        this.router.navigate([Pages.createPath(Pages.appPage), {app}]);
      }
    }
  }

  openForm(idEvent: number): void {
    this.router.navigate([Pages.eventFormPage, {idEvent}]);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
