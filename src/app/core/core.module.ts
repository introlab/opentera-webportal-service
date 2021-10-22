import {NgModule, Optional, SkipSelf} from '@angular/core';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {ServerErrorInterceptor} from '@core/interceptors/server-error.interceptor';
import {AuthenticationService} from '@services/authentication.service';
import {TokenInterceptor} from '@core/interceptors/token.interceptor';
import {AccountResolver} from '@services/resolvers/account.resolver';
import {ServiceResolver} from '@services/resolvers/service.resolver';
import {ParticipantService} from '@services/participant/participant.service';
import {ParticipantProjectService} from '@services/participant/participant-project.service';
import {AccountService} from '@services/account.service';
import {CalendarService} from '@services/calendar.service';
import {LoginButtonService} from '@services/login-button.service';
import {NotificationService} from '@services/notification.service';
import {PermissionsService} from '@services/permissions.service';
import {ProjectService} from '@services/project.service';
import {RefreshingService} from '@services/refreshing.service';
import {SelectedProjectService} from '@services/selected-project.service';
import {SelectedSiteService} from '@services/selected-site.service';
import {ServiceService} from '@services/service.service';
import {SessionTypeService} from '@services/session-type.service';
import {ShowResponsiveNavigationService} from '@services/show-responsive-navigation.service';
import {AuthGuardService} from '@services/guards/auth-guard.service';
import {ApplicationService} from '@services/application.service';
import {GroupService} from '@services/participant/group.service';
import {SelectedGroupService} from '@services/selected-group.service';
import {UserService} from '@services/user.service';
import {UsernameValidator} from '@core/validators/username.validator';
import {SelectedSourceService} from '@services/selected-source.service';
import {WebsocketService} from '@services/websocket.service';
import {SessionManagerService} from '@services/session-manager.service';

@NgModule({
  providers: [
    AuthGuardService,
    AccountResolver,
    ServiceResolver,
    AuthenticationService,
    ParticipantService,
    ParticipantProjectService,
    AccountService,
    CalendarService,
    LoginButtonService,
    NotificationService,
    PermissionsService,
    ProjectService,
    RefreshingService,
    SelectedProjectService,
    SelectedSiteService,
    ServiceService,
    SessionTypeService,
    ShowResponsiveNavigationService,
    ApplicationService,
    GroupService,
    SelectedGroupService,
    UserService,
    SelectedSourceService,
    UsernameValidator,
    WebsocketService,
    SessionManagerService,
    {provide: HTTP_INTERCEPTORS, useClass: ServerErrorInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true}
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error(
        'CoreModule is already loaded. Import it in the AppModule only'
      );
    }
  }
}
