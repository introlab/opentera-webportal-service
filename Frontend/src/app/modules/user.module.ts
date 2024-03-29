import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ParticipantsComponent} from '@pages/user/participants/participants.component';
import {EventFormComponent} from '@pages/event-form/event-form.component';
import {ApplicationsComponent} from '@pages/user/applications/applications.component';
import {SharedModule} from '@shared/shared.module';
import {MaterialModule} from '@shared/material.module';
import {ParticipantFormComponent} from '@components/forms/participant-form/participant-form.component';
import {ApplicationFormComponent} from '@components/forms/application-form/application-form.component';
import {GroupSelectorComponent} from '@components/selectors/group-selector/group-selector.component';
import {ApplicationSelectorComponent} from '@components/selectors/application-selector/application-selector.component';
import {PasswordFormComponent} from '@components/forms/password-form/password-form.component';
import {ProfileFormComponent} from '@components/forms/profile-form/profile-form.component';
import {SelectedParticipantsComponent} from '@components/selected-participants/selected-participants.component';
import {UserRoutingModule} from '@src/app/modules/user-routing.module';
import {MatSlideToggleModule} from "@angular/material/slide-toggle";


@NgModule({
  declarations: [
    ParticipantsComponent,
    EventFormComponent,
    ApplicationsComponent,
    ParticipantFormComponent,
    ApplicationFormComponent,
    GroupSelectorComponent,
    ApplicationSelectorComponent,
    ProfileFormComponent,
    PasswordFormComponent,
    SelectedParticipantsComponent,
  ],
    imports: [
        CommonModule,
        SharedModule,
        MaterialModule,
        UserRoutingModule,
        MatSlideToggleModule,
    ]
})
export class UserModule {
}
