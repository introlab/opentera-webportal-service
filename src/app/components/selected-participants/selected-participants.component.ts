import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {Participant} from '@shared/models/participant.model';

@Component({
  selector: 'app-selected-participants',
  templateUrl: './selected-participants.component.html',
  styleUrls: ['./selected-participants.component.scss']
})
export class SelectedParticipantsComponent implements OnInit, OnChanges {
  @Input() selectedParticipants: Participant[];
  @Input() overlappingParticipants: string[] = [];
  @Output() participantsChange = new EventEmitter();

  constructor() {
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(this.overlappingParticipants);
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
}
