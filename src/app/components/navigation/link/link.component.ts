import {Component, Input, OnInit} from '@angular/core';
import {App} from '@shared/models/app.model';

@Component({
  selector: 'app-link',
  templateUrl: './link.component.html',
  styleUrls: ['./link.component.scss']
})
export class LinkComponent implements OnInit {
  @Input() app!: App;
  link: any;

  constructor() {
  }

  ngOnInit(): void {
    this.link = this.app.app_name?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
}
