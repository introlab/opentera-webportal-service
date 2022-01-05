import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {Participant} from '@shared/models/participant.model';
import {ParticipantSelectorComponent} from '@components/selectors/participant-selector/participant-selector.component';

@Component({
  selector: 'app-selected-participants',
  templateUrl: './selected-participants.component.html',
  styleUrls: ['./selected-participants.component.scss']
})
export class SelectedParticipantsComponent implements OnInit {
  @Input() selectedParticipants: Participant[];
  @Input() selectedParticipantUUID = '';
  @Input() overlappingParticipants: string[] = [];
  @Output() participantsChange = new EventEmitter();
  @ViewChild(ParticipantSelectorComponent) participantSelector: ParticipantSelectorComponent;

  constructor() {
  }

  ngOnInit(): void {
  }

  remove(participant: Participant, index: number): void {
    this.selectedParticipants.splice(index, 1);
    this.participantsChange.emit(this.selectedParticipants);
  }

  newParticipantSelected(value: Participant): void {
    const participant = value;
    const index = this.selectedParticipants.findIndex(p => p.id_participant === participant.id_participant);
    if (index === -1) {
      this.selectedParticipants.push(value);
      this.participantsChange.emit(this.selectedParticipants);
    }
  }

  trackByFn(index: number, item: Participant): number {
    return item.id_participant;
  }

  public selectParticipantByUuid(select_uuid: string): void {
    const selected = this.participantSelector.participants.find((part) => part.participant_uuid === select_uuid);
    if (selected) {
      this.newParticipantSelected(selected);
    }
  }
}
