import {Component, Input, OnInit} from '@angular/core';
import {Application} from '@shared/models/application.model';

@Component({
  selector: 'app-link',
  templateUrl: './app-link.component.html',
  styleUrls: ['./app-link.component.scss']
})
export class AppLinkComponent implements OnInit {
  @Input() app!: Application;
  link: any;

  constructor() {
  }

  ngOnInit(): void {
    this.link = this.app.app_name?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
}
