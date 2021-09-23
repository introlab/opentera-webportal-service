import {Component, OnDestroy, OnInit} from '@angular/core';
import {Event} from '@shared/models/event.model';
import {Subscription} from 'rxjs';
import {Participant} from '@shared/models/participant.model';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-planning',
  templateUrl: './planning.component.html',
  styleUrls: ['./planning.component.scss']
})
export class PlanningComponent implements OnInit, OnDestroy {
  participantsUUIDs: string[] = [];
  participant = '';
  events: Event[] = [];
  private subscriptions: Subscription[] = [];

  constructor(private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    const uuid = this.route.snapshot.paramMap.get('uuid');
    const name = this.route.snapshot.paramMap.get('name');
    if (uuid) {
      this.participantsUUIDs.push(uuid);
    }
    if (name) {
      this.participant = name;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  participantChange(participant: Participant): void {
    this.participantsUUIDs = [participant.participant_uuid];
  }
}
