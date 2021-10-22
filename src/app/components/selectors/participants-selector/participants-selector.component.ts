import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {Participant} from '@shared/models/participant.model';
import {ParticipantService} from '@services/participant/participant.service';
import {SelectedProjectService} from '@services/selected-project.service';
import {combineLatest, Subscription} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {SelectedParticipantService} from '@services/selected-participant.service';

@Component({
  selector: 'app-participants-selector',
  templateUrl: './participants-selector.component.html',
  styleUrls: ['./participants-selector.component.scss']
})
export class ParticipantsSelectorComponent implements OnInit, OnChanges, OnDestroy {
  @Input() noneOption = false;
  @Input() selectedParticipantUUID = '';
  @Output() selectedParticipantChange = new EventEmitter();
  participants: Participant[] = [];
  selectedParticipant: Participant;
  private subscriptions: Subscription[] = [];


  constructor(private participantService: ParticipantService,
              private selectedParticipantService: SelectedParticipantService,
              private selectedProjectService: SelectedProjectService) {
  }

  ngOnInit(): void {
    this.getParticipants();
    this.refreshProjectParticipants();
  }

  private getParticipants(): void {
    const participants$ = this.participantService.participants$();
    const selected$ = this.selectedParticipantService.getSelectedParticipant();
    this.subscriptions.push(
      combineLatest([participants$, selected$]).subscribe(([participants, selectedParticipant]) => {
        this.participants = participants;
        // this.onValueChanged(selectedParticipant);
      })
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
  }

  private refreshProjectParticipants(): void {
    const project$ = this.selectedProjectService.getSelectedProject();
    this.subscriptions.push(
      project$.pipe(
        switchMap((project) => {
          return this.participantService.getByProject(project.id_project);
        })).subscribe((participants) => {
        if (this.selectedParticipantUUID && this.selectedParticipantUUID.length > 0) {
          const selected = participants.find((part) => part.participant_uuid === this.selectedParticipantUUID);
          if (selected) {
            this.selectedParticipant = selected;
          }
        }
      })
    );
  }

  onValueChanged(selected: Participant): void {
    if (this.isDifferentParticipant(selected)) {
      if (!!selected) {
        this.selectedParticipantChange.emit(selected);
      } else {
        this.selectedParticipantChange.emit(null);
      }
    }
  }

  private isDifferentParticipant(selected: Participant): boolean {
    return this.selectedParticipant?.id_participant !== selected?.id_participant;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
