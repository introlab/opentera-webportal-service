import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AppLayoutComponent} from '@shared/layout/app-layout/app-layout.component';
import {LoginLayoutComponent} from '@shared/layout/login-layout/login-layout.component';
import {LoginComponent} from '@pages/login/login.component';
import {AuthGuardService} from '@services/guards/auth-guard.service';
import {CalendarPageComponent} from '@pages/calendar/calendar.component';
import {NotFoundComponent} from '@pages/not-found/not-found.component';
import {AccountResolver} from '@services/resolvers/account.resolver';
import {CallbackComponent} from '@components/callback/callback.component';
import {Pages} from '@core/utils/pages';
import {EventFormComponent} from '@pages/event-form/event-form.component';

const routes: Routes = [
  {path: '', redirectTo: Pages.calendarPage, pathMatch: 'full'},
  {path: 'rehab/participant', component: CallbackComponent},
  {path: 'rehab/user', component: CallbackComponent},
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [AuthGuardService],
    resolve: [AccountResolver],
    children: [
      {path: Pages.calendarPage, component: CalendarPageComponent},
      {path: Pages.eventFormPage, component: EventFormComponent},
      {path: Pages.fourofourPage, component: NotFoundComponent},
      {path: Pages.participantPrefix, loadChildren: () => import('./modules/participant.module').then(m => m.ParticipantModule)},
      {path: Pages.userPrefix, loadChildren: () => import('./modules/user.module').then(m => m.UserModule)},
    ]
  },
  {
    path: '',
    component: LoginLayoutComponent,
    children: [
      {path: Pages.loginPage, component: LoginComponent},
    ]
  },
  {path: '**', redirectTo: Pages.fourofourPage}
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      useHash: false
    })
  ],
  providers: [AuthGuardService],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
