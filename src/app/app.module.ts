import {LOCALE_ID, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {AppLayoutComponent} from '@shared/layout/app-layout/app-layout.component';
import {LoginLayoutComponent} from '@shared/layout/login-layout/login-layout.component';
import {SharedModule} from '@shared/shared.module';
import {LoginComponent} from '@pages/login/login.component';
import {ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from '@shared/material.module';
import {TokenInterceptor} from '@core/interceptors/token.interceptor';
import localeFr from '@angular/common/locales/fr';
import {registerLocaleData} from '@angular/common';
import {AccountResolver} from '@services/resolvers/account.resolver';
import {CalendarComponent} from '@pages/calendar/calendar.component';
import {ParticipantLayoutComponent} from '@shared/layout/participant-layout/participant-layout.component';
import {CalendarModule, DateAdapter} from 'angular-calendar';
import {adapterFactory} from 'angular-calendar/date-adapters/date-fns';

registerLocaleData(localeFr, 'fr');

@NgModule({
  declarations: [
    AppComponent,
    AppLayoutComponent,
    LoginLayoutComponent,
    ParticipantLayoutComponent,
    LoginComponent,
    CalendarComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SharedModule,
    MaterialModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    CalendarModule.forRoot({provide: DateAdapter, useFactory: adapterFactory}),
  ],
  providers: [
    AccountResolver,
    {provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true},
    {provide: LOCALE_ID, useValue: 'FR-fr'},
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
