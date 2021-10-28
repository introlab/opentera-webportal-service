import {NgModule} from '@angular/core';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {AppLayoutComponent} from '@shared/layout/app-layout/app-layout.component';
import {LoginLayoutComponent} from '@shared/layout/login-layout/login-layout.component';
import {SharedModule} from '@shared/shared.module';
import localeFr from '@angular/common/locales/fr';
import {registerLocaleData} from '@angular/common';
import {ParticipantLayoutComponent} from '@shared/layout/participant-layout/participant-layout.component';
import {LoginComponent} from '@pages/login/login.component';
import {NotFoundComponent} from '@pages/not-found/not-found.component';
import {CoreModule} from '@core/core.module';
import {UserModule} from '@src/app/modules/user.module';
import {ParticipantModule} from '@src/app/modules/participant.module';
import {HeaderModule} from '@src/app/modules/header.module';
import {EventDialogComponent} from '@components/event-dialog/event-dialog.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

registerLocaleData(localeFr, 'fr');

@NgModule({
  declarations: [
    AppComponent,
    AppLayoutComponent,
    LoginComponent,
    LoginLayoutComponent,
    ParticipantLayoutComponent,
    NotFoundComponent,
    EventDialogComponent,
  ],
  imports: [
    SharedModule,
    CoreModule,
    BrowserAnimationsModule,
    HeaderModule,
    UserModule,
    ParticipantModule,
    AppRoutingModule,
  ],
  providers: [],
  exports: [
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
