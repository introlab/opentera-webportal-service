import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SelectedSourceService {
  private sourceSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');

  constructor() {
  }

  getSelectedSource(): Observable<string> {
    return this.sourceSubject.asObservable();
  }

  setSelectedSource(source: string): void {
    this.sourceSubject.next(source);
  }
}
