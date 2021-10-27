import {Component, Input, OnInit} from '@angular/core';
import {environment} from '@src/environments/environment';
import {GlobalConstants} from '@core/utils/global-constants';

@Component({
  selector: 'app-logo',
  templateUrl: './logo.component.html',
  styleUrls: ['./logo.component.scss']
})
export class LogoComponent implements OnInit {
  @Input() style!: string;
  imagePath = environment.img_prefix + 'assets/images/IconOpenTera.svg';
  title = GlobalConstants.title;

  constructor() {
  }

  ngOnInit(): void {
  }
}
