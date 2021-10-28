import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RefreshingService {
  private refreshingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor() {
  }

  isRefreshing(): Observable<boolean> {
    return this.refreshingSubject.asObservable();
  }

  refresh(): void {
    this.refreshingSubject.next(true);
  }

  stopRefresh(): void {
    this.refreshingSubject.next(false);
  }
}
