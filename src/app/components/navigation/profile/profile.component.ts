import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthenticationService} from '@services/authentication.service';
import {AccountService} from '@services/account.service';
import {Subscription} from 'rxjs';
import {ApplicationFormComponent} from '@components/forms/application-form/application-form.component';
import {take} from 'rxjs/operators';
import {UserService} from '@services/user.service';
import {MatDialog} from '@angular/material/dialog';
import {NotificationService} from '@services/notification.service';
import {ProfileFormComponent} from '@components/forms/profile-form/profile-form.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  initial = '';
  name = 'name';
  private subscription!: Subscription;

  constructor(private authService: AuthenticationService,
              private userService: UserService,
              public dialog: MatDialog,
              private notificationService: NotificationService,
              private accountService: AccountService) {
  }

  ngOnInit(): void {
    this.subscription = this.accountService.account$().subscribe((res) => {
      if (res.fullname != null) {
        this.name = res.fullname;
        this.initial = this.name.charAt(0);
      }
    });
  }

  logout(): void {
    this.authService.logout().subscribe();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  editProfile(): void {
    const dialogRef = this.dialog.open(ProfileFormComponent, {
      width: '500px',
      disableClose: true,
    });

    dialogRef.afterClosed().pipe(
      take(1)
    ).subscribe((result) => {
      console.log('new user', result);
      if (result) {
        this.userService.update(result).subscribe((updated) => {
          this.notificationService.showSuccess('La modification du profil a été faite.');
        }, (error) => {
          this.notificationService.showError('Impossible de modifier le profil.');
        });
      }
    });
  }
}
