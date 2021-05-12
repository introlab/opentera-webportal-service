import {Component, OnInit} from '@angular/core';
import {GlobalConstants} from '@core/utils/global-constants';

@Component({
  selector: 'app-exercises',
  templateUrl: './exercises.component.html',
  styleUrls: ['./exercises.component.scss']
})
export class ExercisesComponent implements OnInit {
  source = GlobalConstants.physiotecLink;

  constructor() {
  }

  ngOnInit(): void {
  }

}
