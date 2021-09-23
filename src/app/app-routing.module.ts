import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AppLayoutComponent} from '@shared/layout/app-layout/app-layout.component';
import {LoginLayoutComponent} from '@shared/layout/login-layout/login-layout.component';
import {LoginComponent} from '@pages/login/login.component';
import {AuthGuardService} from '@services/guards/auth-guard.service';
import {CalendarPageComponent} from '@pages/calendar/calendar.component';
import {NotFoundComponent} from '@pages/not-found/not-found.component';
import {EmailsComponent} from '@pages/participant/emails/emails.component';
import {SeanceComponent} from '@pages/participant/seance/seance.component';
import {ExercisesComponent} from '@pages/participant/exercices/exercises.component';
import {AccountResolver} from '@services/resolvers/account.resolver';
import {CallbackComponent} from '@components/callback/callback.component';
import {GlobalConstants} from '@core/utils/global-constants';
import {ServiceResolver} from '@services/resolvers/service.resolver';
import {EventFormComponent} from '@pages/event-form/event-form.component';
import {ParticipantsComponent} from '@pages/user/participants/participants.component';
import {ApplicationsComponent} from '@pages/user/applications/applications.component';
import {PlanningComponent} from '@pages/user/planning/planning.component';

const routes: Routes = [
  {path: '', redirectTo: GlobalConstants.calendarPage, pathMatch: 'full'},
  {path: 'rehab/participant', component: CallbackComponent},
  {path: 'rehab/user', component: CallbackComponent},
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [AuthGuardService],
    resolve: [AccountResolver],
    children: [
      {path: GlobalConstants.calendarPage, component: CalendarPageComponent},
      {path: GlobalConstants.participantsPage, component: ParticipantsComponent},
      {path: GlobalConstants.planningPage, component: PlanningComponent},
      {path: GlobalConstants.applicationsPage, component: ApplicationsComponent},
      {path: GlobalConstants.eventFormPage, component: EventFormComponent},
      {path: GlobalConstants.emailPage, component: EmailsComponent},
      {path: GlobalConstants.sessionPage, component: SeanceComponent},
      {path: GlobalConstants.exercisesPage, component: ExercisesComponent},
      {path: GlobalConstants.fourofourPage, component: NotFoundComponent},
    ]
  },
  {
    path: '',
    component: LoginLayoutComponent,
    children: [
      {path: GlobalConstants.loginPage, component: LoginComponent},
    ]
  },
  {path: '**', redirectTo: GlobalConstants.fourofourPage}
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
