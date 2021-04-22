import {Component, HostListener, OnInit} from '@angular/core';
import {ShowResponsiveNavigationService} from '@services/show-responsive-navigation.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit {
  @HostListener('click') onClick(): void {
    this.closeResponsiveNavigation();
  }

  constructor(private showResponsiveNavigationService: ShowResponsiveNavigationService) {
  }

  ngOnInit(): void {
  }

  private closeResponsiveNavigation(): void {
    this.showResponsiveNavigationService.setNavigationView(false);
  }
}
