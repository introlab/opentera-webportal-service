import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AppLayoutComponent} from '@shared/layout/app-layout/app-layout.component';
import {LoginLayoutComponent} from '@shared/layout/login-layout/login-layout.component';
import {LoginComponent} from '@pages/login/login.component';
import {AuthGuardService} from '@services/guards/auth-guard.service';
import {HomeComponent} from '@pages/home/home.component';
import {NotFoundComponent} from '@pages/not-found/not-found.component';
import {EmailsComponent} from '@pages/emails/emails.component';
import {SeanceComponent} from '@pages/seance/seance.component';
import {ExercisesComponent} from '@pages/exercices/exercises.component';

const routes: Routes = [
  {
    path: '', redirectTo: '/calendrier', pathMatch: 'full'
  },
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [AuthGuardService],
    children: [
      {
        path: 'calendrier', component: HomeComponent
      },
      {
        path: 'courriel', component: EmailsComponent
      },
      {
        path: 'seance', component: SeanceComponent
      },
      {
        path: 'exercices', component: ExercisesComponent
      },
      {
        path: '404', component: NotFoundComponent
      },
    ]
  },
  {
    path: '',
    component: LoginLayoutComponent,
    children: [
      {
        path: 'connexion', component: LoginComponent
      },
    ]
  },
  {
    path: '**', redirectTo: '/404'
  }
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
