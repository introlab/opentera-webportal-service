import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthenticationService} from '@services/authentication.service';
import {AccountService} from '@services/account.service';
import {Subscription} from 'rxjs';

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
}
