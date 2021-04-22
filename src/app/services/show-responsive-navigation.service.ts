import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShowResponsiveNavigationService {
  private showNavigationSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor() {
  }

  showNavigation(): Observable<boolean> {
    return this.showNavigationSubject.asObservable();
  }

  setNavigationView(show: boolean): void {
    this.showNavigationSubject.next(show);
  }
}
