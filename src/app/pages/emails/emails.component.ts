import {Component, OnInit} from '@angular/core';
import {GlobalConstants} from '@core/utils/global-constants';

@Component({
  selector: 'app-emails',
  templateUrl: './emails.component.html',
  styleUrls: ['./emails.component.scss']
})
export class EmailsComponent implements OnInit {
  source = GlobalConstants.emailLink;

  constructor() {
  }

  ngOnInit(): void {
  }

}
