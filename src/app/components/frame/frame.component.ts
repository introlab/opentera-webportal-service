import {Component, OnDestroy, OnInit} from '@angular/core';
import {SelectedSourceService} from '@services/selected-source.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-frame',
  templateUrl: './frame.component.html',
  styleUrls: ['./frame.component.scss']
})
export class FrameComponent implements OnInit, OnDestroy {
  outsideSource = '';
  private subscription: Subscription;

  constructor(private selectedSourceService: SelectedSourceService) {
  }

  ngOnInit(): void {
    this.subscription = this.selectedSourceService.getSelectedSource().subscribe((source) => {
      this.outsideSource = source;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
