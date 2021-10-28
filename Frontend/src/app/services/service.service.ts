import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {makeApiURL} from '@core/utils/make-api-url';
import {GlobalConstants} from '@core/utils/global-constants';
import {Service} from '@shared/models/service.model';
import {shareReplay, tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  private API_URL = makeApiURL();
  private controller = 'user/services';
  private serviceSubject: BehaviorSubject<Service> = new BehaviorSubject<Service>(null);
  private servicesSubject: BehaviorSubject<Service[]> = new BehaviorSubject<Service[]>([]);

  constructor(private http: HttpClient) {
  }

  service$(): Observable<Service> {
    return this.serviceSubject.asObservable().pipe(shareReplay(1));
  }

  getByKey(): Observable<Service[]> {
    const filters = '?with_projects=true&key=' + GlobalConstants.serviceKey;
    return this.http.get<Service[]>(this.API_URL + this.controller + filters).pipe(
      tap((services) => {
        this.serviceSubject.next(services[0]);
      })
    );
  }

  getByProject(idProject: number): Observable<Service[]> {
    const filter = '?id_project=' + idProject;
    return this.http.get<Service[]>(this.API_URL + this.controller + filter).pipe(
      tap((services) => {
        this.servicesSubject.next(services);
      })
    );
  }
}
