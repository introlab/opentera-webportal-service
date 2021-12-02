import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginButtonService {
  private isDisabledSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor() {
  }

  isDisabled(): Observable<boolean> {
    return this.isDisabledSubject.asObservable();
  }

  enableButton(isEnabled: boolean): void {
    this.isDisabledSubject.next(isEnabled);
  }
}
