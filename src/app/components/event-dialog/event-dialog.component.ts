import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {Event} from '@shared/models/event.model';

@Component({
  selector: 'app-event-dialog',
  templateUrl: './event-dialog.component.html',
  styleUrls: ['./event-dialog.component.scss']
})
export class EventDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: Event) { }

  ngOnInit(): void {
  }

}
