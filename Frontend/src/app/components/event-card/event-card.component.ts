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
import {combineLatest, Subscription} from 'rxjs';
import {Account} from '@shared/models/account.model';
import {SelectedSourceService} from '@services/selected-source.service';
import {Session} from '@shared/models/session.model';
import {PermissionsService} from '@services/permissions.service';
import {CalendarView} from 'angular-calendar';
import {Permission} from '@shared/models/permission.model';
import {getVideoRehabURL} from '@core/utils/make-api-url';
import {GlobalConstants} from '@core/utils/global-constants';
import {CookieService} from 'ngx-cookie-service';

@Component({
  selector: 'app-event-card',
  templateUrl: './event-card.component.html',
  styleUrls: ['./event-card.component.scss']
})
export class EventCardComponent implements OnInit, OnDestroy {
  @Input() event: Event;
  session: Session;
  duration: string;
  isUser = false;
  isLive = false;
  isInvited = false;
  isPastEvent = true;
  isOpenTeraEvent = false;
  hasEventURL = false;
  permissions: Permission;
  private subscription: Subscription;
  private account: Account;

  constructor(private calendarService: CalendarService,
              private router: Router,
              private accountService: AccountService,
              private selectedSourceService: SelectedSourceService,
              private permissionsService: PermissionsService,
              private notificationService: NotificationService,
              private cookieService: CookieService,
              public dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.session = this.event.session && this.event.session.length > 0 ? this.event.session[0] : null;
    this.getAccount();
    this.checkIfEventIsLive();
    this.checkIfEventIsPassed();
    this.checkIfEventURL();
    this.getDuration();
  }

  private getAccount(): void {
    const account$ = this.accountService.account$();
    const permissions$ = this.permissionsService.permissions$();
    this.subscription = combineLatest([account$, permissions$]).subscribe(([account, permissions]) => {
      this.permissions = permissions;
      this.account = account;
      this.isUser = isUser(account);
      if (this.isUser) {
        this.isInvited = (this.event.user_uuid === account.user.user_uuid);
      }else{
        this.isInvited = (this.event.session_participant_uuids.indexOf(account.login_uuid) >= 0);
      }
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

  private checkIfEventURL(): void {
    this.isOpenTeraEvent = this.session.session_type.session_type_service_key === 'VideoRehabService';
    // console.log(this.event.event_name + ' - OpenTera? = ' + this.isOpenTeraEvent);
    this.hasEventURL = (this.event.event_static_url && this.event.event_static_url.length > 0);
    // console.log(this.event.event_name + ' - hasEventURL? = ' + this.hasEventURL);
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
    if (this.hasEventURL) {
      window.open(this.event.event_static_url, '_blank');
    } else if (!this.isUser) {
      const videoRehabApp = this.account.apps.find((app) => app.app_service_key === 'VideoRehabService');
      if (videoRehabApp && videoRehabApp.app_config) {
        this.selectedSourceService.setSelectedSource(videoRehabApp.app_config.app_config_url);
        const app = videoRehabApp.app_name?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        this.router.navigate([Pages.createPath(Pages.appPage), {app}]).then();
      }
    }else{ // isUser
      // User connect
      const url = getVideoRehabURL() + 'user_session_lobby?token=' + this.cookieService.get(GlobalConstants.cookieValue) + '&session_uuid='
        + this.event.session_uuid;
      console.log('Loading session lobby at ' + url);
      this.selectedSourceService.setSelectedSource(url);
      this.router.navigate([Pages.createPath(Pages.appPage)]).then();
    }
  }

  openForm(idEvent: number): void {
    this.router.navigate([Pages.eventFormPage, {idEvent}]).then();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
