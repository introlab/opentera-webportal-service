import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {EmailsComponent} from '@pages/participant/emails/emails.component';
import {SharedModule} from '@shared/shared.module';
import {MaterialModule} from '@shared/material.module';
import {ParticipantRoutingModule} from '@src/app/modules/participant-routing.module';


@NgModule({
  declarations: [
    EmailsComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    MaterialModule,
    ParticipantRoutingModule
  ]
})
export class ParticipantModule {
}
