import {Component, OnInit} from '@angular/core';
import {GlobalConstants} from '@core/utils/global-constants';

@Component({
  selector: 'app-seance',
  templateUrl: './seance.component.html',
  styleUrls: ['./seance.component.scss']
})
export class SeanceComponent implements OnInit {
  source = GlobalConstants.seanceLink;

  constructor() {
  }

  ngOnInit(): void {
  }

}
