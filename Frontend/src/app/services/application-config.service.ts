import { Injectable } from '@angular/core';
import {makeApiURL} from '@core/utils/make-api-url';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApplicationConfig} from '@shared/models/application-config.model';

@Injectable({
  providedIn: 'root'
})
export class ApplicationConfigService {
  private API_URL = makeApiURL(true);
  private controller = 'app-configs';

  constructor(private http: HttpClient) { }

  getByParticipant(participantUUID: string): Observable<ApplicationConfig[]> {
    return this.http.get<ApplicationConfig[]>(this.API_URL + this.controller + '?participant_uuid=' + participantUUID);
  }

  update(configs: ApplicationConfig[]): Observable<ApplicationConfig[]> {
    return this.http.post<ApplicationConfig[]>(this.API_URL + this.controller, {configs});
  }
}
