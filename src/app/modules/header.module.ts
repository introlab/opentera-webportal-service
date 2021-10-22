import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NavigationComponent} from '@components/header/navigation/navigation.component';
import {ProfileComponent} from '@components/header/profile/profile.component';
import {AppLinkComponent} from '@components/header/app-link/app-link.component';
import {MenuHamburgerComponent} from '@components/header/menu-hamburger/menu-hamburger.component';
import {HeaderComponent} from '@components/header/header/header.component';
import {ResponsiveNavigationComponent} from '@components/header/responsive-navigation/responsive-navigation.component';
import {SharedModule} from '@shared/shared.module';
import {InSessionToolbarComponent} from '@components/header/in-session-toolbar/in-session-toolbar.component';


@NgModule({
  declarations: [
    NavigationComponent,
    ProfileComponent,
    AppLinkComponent,
    MenuHamburgerComponent,
    HeaderComponent,
    ResponsiveNavigationComponent,
    InSessionToolbarComponent
  ],
  exports: [
    ResponsiveNavigationComponent,
    HeaderComponent,
    InSessionToolbarComponent
  ],
  imports: [
    CommonModule,
    SharedModule
  ]
})
export class HeaderModule {
}
