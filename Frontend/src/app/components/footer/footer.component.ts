import {Component, OnInit} from '@angular/core';
import {GlobalConstants} from '@core/utils/global-constants';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  version = 'v.' + GlobalConstants.version;
  organism = GlobalConstants.organism;

  constructor() {
  }

  ngOnInit(): void {
  }

}
