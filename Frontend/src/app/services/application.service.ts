import {Injectable} from '@angular/core';
import {makeApiURL} from '@core/utils/make-api-url';
import {BehaviorSubject, Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {shareReplay, tap} from 'rxjs/operators';
import {Application} from '@shared/models/application.model';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  private API_URL = makeApiURL(true);
  private controller = 'apps';
  private apps: Application[] = [];
  private appsSubject: BehaviorSubject<Application[]> = new BehaviorSubject<Application[]>([]);

  constructor(private http: HttpClient) {
  }

  applications$(): Observable<Application[]> {
    return this.appsSubject.asObservable().pipe(shareReplay(1));
  }

  getByProject(idProject: number): Observable<Application[]> {
    const filter = `?id_project=${idProject}`;
    return this.http.get<Application[]>(this.API_URL + this.controller + filter)
      .pipe(tap((result) => {
        this.apps = result;
        this.appsSubject.next(result);
      }));
  }

  update(app: Application): Observable<Application[]> {
    return this.http.post<Application[]>(this.API_URL + this.controller, {app}).pipe(
      tap((result) => {
        const updatedApp: Application = result[0];
        if (app.id_app > 0) {
          const index = this.apps.findIndex(t => t.id_app === app.id_app);
          this.apps[index] = updatedApp;
          this.apps = [...this.apps];
        } else {
          app.id_app = updatedApp.id_app;
          this.apps = [...this.apps, app];
        }
        this.appsSubject.next(this.apps);
      })
    );
  }

  delete(idApp: number): Observable<any> {
    return this.http.delete(this.API_URL + this.controller + '?id=' + idApp).pipe(
      tap(() => {
        this.apps = this.apps.filter(t => t.id_app !== idApp);
        this.appsSubject.next(this.apps);
      })
    );
  }
}
