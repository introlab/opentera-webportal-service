import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Pages} from '@core/utils/pages';
import {Subscription} from 'rxjs';
import {AccountService} from '@services/account.service';
import {Account} from '@shared/models/account.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  private subscription: Subscription;
  private account: Account;

  constructor(public router: Router,
              private accountService: AccountService) {
  }

  ngOnInit(): void {
    this.subscription = this.accountService.account$().subscribe((account) => {
      this.account = account;
    });
  }

  goHome(): void {
    this.router.navigate([Pages.homePage]);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
