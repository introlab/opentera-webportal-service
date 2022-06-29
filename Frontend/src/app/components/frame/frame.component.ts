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
  frameLoading = false;
  private firstLoad = true;

  constructor(private selectedSourceService: SelectedSourceService) {
  }

  ngOnInit(): void {
    this.subscription = this.selectedSourceService.getSelectedSource().subscribe((source) => {
      if (!source || this.outsideSource === source){
        return;
      }
      this.outsideSource = source;
      console.log('Loading: ' + source);
      this.frameLoading = true;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  iframeLoadedCallBack(): void {
    if (this.firstLoad){
      this.firstLoad = false;
      return;
    }
    console.log('Frame loaded!');
    this.frameLoading = false;
  }

}
