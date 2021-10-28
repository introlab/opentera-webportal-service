import {Component, OnDestroy, OnInit} from '@angular/core';
import {GlobalConstants} from '@core/utils/global-constants';
import {SelectedSourceService} from '@services/selected-source.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-emails',
  templateUrl: './emails.component.html',
  styleUrls: ['./emails.component.scss']
})
export class EmailsComponent implements OnInit, OnDestroy {
  source = GlobalConstants.emailLink;
  private subscription: Subscription;

  constructor(private selectedSourceService: SelectedSourceService) {
  }

  ngOnInit(): void {
    this.subscription = this.selectedSourceService.getSelectedSource().subscribe((source) => this.source = source);
  }

  openInbox(): void {
    window.open(this.source, '_blank');
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
