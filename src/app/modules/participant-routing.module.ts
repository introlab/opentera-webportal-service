import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {FrameComponent} from '@components/frame/frame.component';
import {Pages} from '@core/utils/pages';
import {EmailsComponent} from '@pages/participant/emails/emails.component';
import {CommonModule} from '@angular/common';

const routes: Routes = [
  {path: Pages.appPage, component: FrameComponent},
  {path: Pages.emailPage, component: EmailsComponent},
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class ParticipantRoutingModule {
}
