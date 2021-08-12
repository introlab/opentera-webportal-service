import {Injectable} from '@angular/core';
import {makeApiURL} from '@core/utils/make-api-url';
import {BehaviorSubject, Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {shareReplay, tap} from 'rxjs/operators';
import {Account} from '@shared/models/account.model';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private API_URL = makeApiURL(true);
  private controller = 'me';
  private accountSubject: BehaviorSubject<Account> = new BehaviorSubject<Account>(new Account());

  constructor(private http: HttpClient) {
  }

  account$(): Observable<Account> {
    return this.accountSubject.asObservable().pipe(shareReplay(1));
  }

  setAccount(account: Account): void {
    this.accountSubject.next(account);
  }

  getWithToken(): Observable<Account> {
    return this.http.get<Account>(this.API_URL + this.controller).pipe(
      tap((account) => {
        this.setAccount(account);
      }),
      shareReplay(1)
    );
  }
}
