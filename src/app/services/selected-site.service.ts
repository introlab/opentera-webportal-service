import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {Site} from '@shared/models/site.model';

@Injectable({
  providedIn: 'root'
})
export class SelectedSiteService {
  private siteSubject: BehaviorSubject<Site> = new BehaviorSubject<Site>(new Site());

  constructor() {
  }

  getSelectedSite(): Observable<Site> {
    return this.siteSubject.asObservable();
  }

  setSelectedSite(site: Site): void {
    this.siteSubject.next(site);
  }
}
