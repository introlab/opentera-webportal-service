import { Component, OnInit } from '@angular/core';
import {SessionManagerService} from '@services/session-manager.service';
import {ConfirmationComponent} from '@components/confirmation/confirmation.component';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-in-session-toolbar',
  templateUrl: './in-session-toolbar.component.html',
  styleUrls: ['./in-session-toolbar.component.scss']
})

export class InSessionToolbarComponent implements OnInit {

  constructor(private sessionManagerService: SessionManagerService,
              public dialog: MatDialog) { }

  ngOnInit(): void {
  }

  stopSession(): void {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      width: '350px',
      data: 'Voulez-vous terminer cette séance?'
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.sessionManagerService.stopSession().subscribe(
          (data) => {
          }, (error) => {
            console.error(error);
          }
        );
      }
    });
  }
}
