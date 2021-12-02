import {Component, Input, OnInit} from '@angular/core';
import {Event} from '@shared/models/event.model';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss']
})
export class EventsComponent implements OnInit {
  @Input() events: Event[];

  constructor() {
  }

  ngOnInit(): void {
  }

  trackByFn(index: number, item: Event): number | undefined {
    return item.id_event;
  }
}
