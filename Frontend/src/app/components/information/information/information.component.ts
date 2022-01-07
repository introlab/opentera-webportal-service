import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.scss']
})
export class InformationComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<InformationComponent>,
              @Inject(MAT_DIALOG_DATA) public data: {message: string, button_text: string}) {
  }

  ngOnInit(): void {
  }

}
