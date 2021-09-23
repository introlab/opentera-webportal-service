import {Component, OnDestroy, OnInit} from '@angular/core';
import {ShowResponsiveNavigationService} from '@services/show-responsive-navigation.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-menu-hamburger',
  templateUrl: './menu-hamburger.component.html',
  styleUrls: ['./menu-hamburger.component.scss']
})
export class MenuHamburgerComponent implements OnInit, OnDestroy {
  openHamburger = false;
  private subscription!: Subscription;

  constructor(private showNavService: ShowResponsiveNavigationService) {
  }

  ngOnInit(): void {
    this.subscription = this.showNavService.showNavigation().subscribe((res) => {
      this.openHamburger = res;
    });
  }

  toggleHamburger(): void {
    this.showNavService.setNavigationView(!this.openHamburger);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
