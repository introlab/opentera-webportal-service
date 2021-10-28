import {Component, OnDestroy, OnInit} from '@angular/core';
import {ShowResponsiveNavigationService} from '@services/show-responsive-navigation.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-responsive-navigation',
  templateUrl: './responsive-navigation.component.html',
  styleUrls: ['./responsive-navigation.component.scss']
})
export class ResponsiveNavigationComponent implements OnInit, OnDestroy {
  show = false;
  private subscription!: Subscription;

  constructor(private showNavService: ShowResponsiveNavigationService) {
  }

  ngOnInit(): void {
    this.subscription = this.showNavService.showNavigation().subscribe((res) => {
      this.show = res;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
