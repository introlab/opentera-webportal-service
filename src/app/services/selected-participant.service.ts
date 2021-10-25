import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {Participant} from '@shared/models/participant.model';

@Injectable({
  providedIn: 'root'
})
export class SelectedParticipantService {
  private sourceSubject: BehaviorSubject<Participant> = new BehaviorSubject<Participant>(null);

  constructor() {
  }

  getSelectedParticipant(): Observable<Participant> {
    return this.sourceSubject.asObservable();
  }

  setSelectedParticipant(source: Participant): void {
    this.sourceSubject.next(source);
  }
}
