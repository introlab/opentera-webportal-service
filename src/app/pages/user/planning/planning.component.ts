import {Component, OnInit} from '@angular/core';
import {Event} from '@shared/models/event.model';
import {Participant} from '@shared/models/participant.model';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-planning',
  templateUrl: './planning.component.html',
  styleUrls: ['./planning.component.scss']
})
export class PlanningComponent implements OnInit {
  participantsUUIDs: string[] = [];
  participant = '';
  events: Event[] = [];

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

  participantChange(participant: Participant): void {
    this.participant = participant.participant_name;
    this.participantsUUIDs = [participant.participant_uuid];
  }
}
