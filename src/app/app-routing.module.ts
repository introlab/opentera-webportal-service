import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AppLayoutComponent} from '@shared/layout/app-layout/app-layout.component';
import {LoginLayoutComponent} from '@shared/layout/login-layout/login-layout.component';
import {LoginComponent} from '@pages/login/login.component';
import {AuthGuardService} from '@services/guards/auth-guard.service';
import {HomeComponent} from '@pages/home/home.component';

const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [AuthGuardService],
    children: [
      {
        path: 'accueil',
        component: HomeComponent
      },
      {
        path: '',
        redirectTo: '',
        pathMatch: 'full'
      },
    ]
  },
  {
    path: '',
    component: LoginLayoutComponent,
    children: [
      {
        path: 'connexion',
        component: LoginComponent
      }
    ]
  },
  {path: '**', redirectTo: 'connexion'}
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
