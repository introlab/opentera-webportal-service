import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {ParticipantsComponent} from '@pages/user/participants/participants.component';
import {ApplicationsComponent} from '@pages/user/applications/applications.component';
import {CommonModule} from '@angular/common';
import {Pages} from '@core/utils/pages';
import {FrameComponent} from '@components/frame/frame.component';

const routes: Routes = [
  {path: Pages.participantsPage, component: ParticipantsComponent},
  {path: Pages.applicationsPage, component: ApplicationsComponent},
  {path: Pages.appPage, component: FrameComponent},
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
