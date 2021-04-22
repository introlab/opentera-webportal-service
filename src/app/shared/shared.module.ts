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


@NgModule({
  declarations: [
    HeaderComponent,
    ResponsiveNavigationComponent,
    NavigationComponent,
    MenuHamburgerComponent,
    ProfileComponent,
    FooterComponent,
    LogoComponent
  ],
  exports: [
    HeaderComponent,
    ResponsiveNavigationComponent,
    FooterComponent,
    LogoComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule,
    AngularSvgIconModule.forRoot(),
  ]
})
export class SharedModule {
}
