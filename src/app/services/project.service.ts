import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {makeApiURL} from '@core/utils/make-api-url';
import {Project} from '@shared/models/project.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private API_URL = makeApiURL();
  private controller = 'user/projects';

  private projectsList: Project[] = [];
  private projectsListSubject: BehaviorSubject<Project[]> = new BehaviorSubject<Project[]>([]);

  constructor(private http: HttpClient) {
  }

  getBySite(idSite: number): Observable<Project[]> {
    return this.http.get<Project[]>(this.API_URL + this.controller + '?id_site=' + idSite)
      .pipe(tap(result => {
        this.projectsListSubject.next(result);
      }));
  }
}
