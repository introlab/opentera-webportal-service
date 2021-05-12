import {Component, OnInit} from '@angular/core';
import {GlobalConstants} from '@core/utils/global-constants';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  username = '';
  source = GlobalConstants.calendarLinkStart + this.username + GlobalConstants.calendarLinkEnd;

  constructor() {
  }

  ngOnInit(): void {
  }
}
