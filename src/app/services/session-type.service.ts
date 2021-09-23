import {Injectable} from '@angular/core';
import {makeApiURL} from '@core/utils/make-api-url';
import {BehaviorSubject, Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {tap} from 'rxjs/operators';
import {SessionType} from '@shared/models/session-type.model';

@Injectable({
  providedIn: 'root'
})
export class SessionTypeService {
  private API_URL = makeApiURL(false);
  private controller = 'user/sessiontypes';

  private sessionTypesList: SessionType[] = [];
  private sessionTypesListSubject: BehaviorSubject<SessionType[]> = new BehaviorSubject<SessionType[]>([]);

  constructor(private http: HttpClient) {
  }

  sessionTypesList$(): Observable<SessionType[]> {
    return this.sessionTypesListSubject.asObservable();
  }

  getByProject(idProject: number): Observable<SessionType[]> {
    return this.http.get<SessionType[]>(this.API_URL + this.controller + '?id_project=' + idProject).pipe(
      tap(result => {
        this.sessionTypesList = result;
        this.sessionTypesListSubject.next(this.sessionTypesList);
      })
    );
  }
}
