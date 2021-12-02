import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SelectedParticipantsService {
  private selectedParticipantsUUIDS: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  constructor() {
  }

  getSelectedParticipantsUUIDS(): Observable<string[]> {
    return this.selectedParticipantsUUIDS.asObservable();
  }

  setSelectedParticipants(UUIDs: string[]): void {
    this.selectedParticipantsUUIDS.next(UUIDs);
  }
}
