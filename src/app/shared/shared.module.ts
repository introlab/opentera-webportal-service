import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ResponsiveNavigationComponent} from '@components/navigation/responsive-navigation/responsive-navigation.component';
import {NavigationComponent} from '@components/navigation/navigation/navigation.component';
import {MenuHamburgerComponent} from '@components/navigation/menu-hamburger/menu-hamburger.component';
import {ProfileComponent} from '@components/navigation/profile/profile.component';
import {HeaderComponent} from '@components/navigation/header/header.component';
import {MaterialModule} from '@shared/material.module';
import {FooterComponent} from '@components/footer/footer.component';
import {RouterModule} from '@angular/router';
import {LogoComponent} from '@components/logo/logo.component';
import {AngularSvgIconModule} from 'angular-svg-icon';
import {FrameComponent} from '@components/frame/frame.component';
import {HomeComponent} from '@pages/home/home.component';
import {NotFoundComponent} from '@pages/not-found/not-found.component';
import {LinkComponent} from '@components/navigation/link/link.component';
import {EmailsComponent} from '@pages/emails/emails.component';
import {SeanceComponent} from '@pages/seance/seance.component';
import {ExercisesComponent} from '@pages/exercices/exercises.component';
import {SafeUrlPipe} from '@core/pipes/safe-url.pipe';


@NgModule({
  declarations: [
    HeaderComponent,
    ResponsiveNavigationComponent,
    NavigationComponent,
    MenuHamburgerComponent,
    ProfileComponent,
    FooterComponent,
    LogoComponent,
    FrameComponent,
    HomeComponent,
    EmailsComponent,
    SeanceComponent,
    ExercisesComponent,
    NotFoundComponent,
    LinkComponent,
    SafeUrlPipe
  ],
  exports: [
    HeaderComponent,
    ResponsiveNavigationComponent,
    FooterComponent,
    LogoComponent,
  ],
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule,
    AngularSvgIconModule.forRoot(),
  ],
  providers: []
})
export class SharedModule {
}
