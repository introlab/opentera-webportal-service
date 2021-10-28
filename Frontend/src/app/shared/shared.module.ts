import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MaterialModule} from '@shared/material.module';
import {RouterModule} from '@angular/router';
import {LogoComponent} from '@components/logo/logo.component';
import {AngularSvgIconModule} from 'angular-svg-icon';
import {FrameComponent} from '@components/frame/frame.component';
import {SafeUrlPipe} from '@core/pipes/safe-url.pipe';
import {SpinnerComponent} from '@components/spinner/spinner.component';
import {SiteSelectorComponent} from '@components/selectors/site-selector/site-selector.component';
import {ProjectSelectorComponent} from '@components/selectors/project-selector/project-selector.component';
import {TruncatePipe} from '@core/pipes/truncate.pipe';
import {ConfirmationComponent} from '@components/confirmation/confirmation.component';
import {EventCardComponent} from '@components/event-card/event-card.component';
import {ReactiveFormsModule} from '@angular/forms';
import {SessionTypeSelectorComponent} from '@components/selectors/session-type-selector/session-type-selector.component';
import {EventFormComponent} from '@pages/event-form/event-form.component';
import {ParticipantSelectorComponent} from '@components/selectors/participant-selector/participant-selector.component';
import {CallbackComponent} from '@components/callback/callback.component';
import {EventsComponent} from '@components/events/events.component';
import {CalendarModule, DateAdapter} from 'angular-calendar';
import {adapterFactory} from 'angular-calendar/date-adapters/date-fns';
import {FooterComponent} from '@components/footer/footer.component';
import {CalendarComponent} from '@components/calendar/calendar.component';
import {CalendarPageComponent} from '@pages/calendar/calendar.component';
import {NgxMatDatetimePickerModule, NgxMatNativeDateModule} from '@angular-material-components/datetime-picker';
import {DatetimeSelectorComponent} from '@components/selectors/datetime-selector/datetime-selector.component';
import {UserSelectorComponent} from '@components/selectors/user-selector/user-selector.component';
import {HttpClientModule} from '@angular/common/http';


@NgModule({
  declarations: [
    SpinnerComponent,
    ProjectSelectorComponent,
    SiteSelectorComponent,
    CallbackComponent,
    EventsComponent,
    FrameComponent,
    SafeUrlPipe,
    TruncatePipe,
    ConfirmationComponent,
    EventCardComponent,
    SessionTypeSelectorComponent,
    ParticipantSelectorComponent,
    LogoComponent,
    FooterComponent,
    CalendarComponent,
    CalendarPageComponent,
    DatetimeSelectorComponent,
    UserSelectorComponent,
  ],
  exports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MaterialModule,
    NgxMatDatetimePickerModule,
    AngularSvgIconModule,
    TruncatePipe,
    CalendarComponent,
    EventsComponent,
    DatetimeSelectorComponent,
    UserSelectorComponent,
    SpinnerComponent,
    SiteSelectorComponent,
    ProjectSelectorComponent,
    FrameComponent,
    LogoComponent,
    SessionTypeSelectorComponent,
    ParticipantSelectorComponent,
    FooterComponent,
    EventCardComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule,
    HttpClientModule,
    ReactiveFormsModule,
    NgxMatDatetimePickerModule,
    NgxMatNativeDateModule,
    AngularSvgIconModule.forRoot(),
    CalendarModule.forRoot({provide: DateAdapter, useFactory: adapterFactory}),
  ],
  providers: [],
  entryComponents: [
    ConfirmationComponent,
    EventFormComponent
  ]
})
export class SharedModule {
}
