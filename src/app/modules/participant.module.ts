import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {EmailsComponent} from '@pages/participant/emails/emails.component';
import {SeanceComponent} from '@pages/participant/seance/seance.component';
import {ExercisesComponent} from '@pages/participant/exercices/exercises.component';
import {SharedModule} from '@shared/shared.module';
import {MaterialModule} from '@shared/material.module';


@NgModule({
  declarations: [
    EmailsComponent,
    SeanceComponent,
    ExercisesComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    MaterialModule
  ]
})
export class ParticipantModule {
}
