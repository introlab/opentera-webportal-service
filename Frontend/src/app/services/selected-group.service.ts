import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {Group} from '@shared/models/group.model';

@Injectable({
  providedIn: 'root'
})
export class SelectedGroupService {
  private groupSubject: BehaviorSubject<Group> = new BehaviorSubject<Group>(new Group());

  constructor() {
  }

  getSelectedGroup(): Observable<Group> {
    return this.groupSubject.asObservable();
  }

  setSelectedGroup(group: Group): void {
    this.groupSubject.next(group);
  }
}
