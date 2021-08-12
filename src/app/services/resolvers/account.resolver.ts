import {Injectable} from '@angular/core';
import {Router, Resolve, RouterStateSnapshot, ActivatedRouteSnapshot} from '@angular/router';
import {Observable, of, throwError} from 'rxjs';
import {AccountService} from '@services/account.service';
import {Account} from '@shared/models/account.model';
import {catchError, map, shareReplay, tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AccountResolver implements Resolve<Account> {
  private account: any = undefined;

  constructor(private accountService: AccountService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Account> {
    return this.getAccountFromAPI();
  }

  private getSavedAccount(): Observable<Account> {
    return of(this.account);
  }

  private getAccountFromAPI(): Observable<Account> {
    return this.accountService.getWithToken().pipe(
      tap((dataFromApi) => {
        this.account = dataFromApi;
        console.log(dataFromApi);
      }),
      shareReplay(1),
      map((dataFromApi) => dataFromApi),
      catchError((err) => throwError(err))
    );
  }
}
