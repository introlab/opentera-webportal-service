import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Participant} from '@shared/models/participant.model';
import {ParticipantService} from '@services/participant/participant.service';
import {SelectedProjectService} from '@services/selected-project.service';
import {Observable, Subscription} from 'rxjs';
import {switchMap} from 'rxjs/operators';

@Component({
  selector: 'app-participants-selector',
  templateUrl: './participants-selector.component.html',
  styleUrls: ['./participants-selector.component.scss']
})
export class ParticipantsSelectorComponent implements OnInit, OnDestroy {
  @Input() noneOption = false;
  @Output() selectedParticipantChange = new EventEmitter();
  participants$: Observable<Participant[]>;
  selectedParticipant: Participant;
  private subscriptions: Subscription[] = [];


  constructor(private participantService: ParticipantService,
              private selectedProjectService: SelectedProjectService) {
  }

  ngOnInit(): void {
    this.participants$ = this.participantService.participants$();
    this.getProjectParticipants();
  }

  private getProjectParticipants(): void {
    const project$ = this.selectedProjectService.getSelectedProject();
    this.subscriptions.push(
      project$.pipe(
        switchMap((project) => {
          return this.participantService.getByProject(project.id_project);
        })).subscribe()
    );
  }

  onValueChanged(selected: Participant): void {
    this.selectedParticipantChange.emit(selected);
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
