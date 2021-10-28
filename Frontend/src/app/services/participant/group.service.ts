import { Injectable } from '@angular/core';
import {makeApiURL} from '@core/utils/make-api-url';
import {BehaviorSubject, Observable} from 'rxjs';
import {Group} from '@shared/models/group.model';
import {HttpClient} from '@angular/common/http';
import {shareReplay, tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private API_URL = makeApiURL();
  private controller = 'user/groups';

  private groups: Group[] = [];
  private groupsSubject: BehaviorSubject<Group[]> = new BehaviorSubject<Group[]>([]);

  constructor(private http: HttpClient) {
  }

  groups$(): Observable<Group[]> {
    return this.groupsSubject.asObservable().pipe(shareReplay(1));
  }

  getByProject(idProject: number): Observable<Group[]> {
    return this.http.get<Group[]>(this.API_URL + this.controller + '?id_project=' + idProject).pipe(
      tap((result) => {
        this.groups = result;
        this.groupsSubject.next(this.groups);
      })
    );
  }
}
