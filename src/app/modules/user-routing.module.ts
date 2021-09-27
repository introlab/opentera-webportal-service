import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {ParticipantsComponent} from '@pages/user/participants/participants.component';
import {PlanningComponent} from '@pages/user/planning/planning.component';
import {ApplicationsComponent} from '@pages/user/applications/applications.component';
import {CommonModule} from '@angular/common';
import {Pages} from '@core/utils/pages';

const routes: Routes = [
  {path: Pages.participantsPage, component: ParticipantsComponent},
  {path: Pages.planningPage, component: PlanningComponent},
  {path: Pages.applicationsPage, component: ApplicationsComponent},
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class UserRoutingModule {
}
