import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {makeApiURL} from '@core/utils/make-api-url';
import {User} from '@shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private API_URL = makeApiURL();
  private controller = 'user/users';

  constructor(private http: HttpClient) {
  }

  getById(id: number): Observable<User[]> {
    return this.http.get<User[]>(this.API_URL + this.controller + '?with_usergroups=true&id_user=' + id);
  }

  getByUsername(username: string): Observable<User[]> {
    return this.http.get<User[]>(this.API_URL + this.controller + '?username=' + username);
  }

  getBySite(idSite: number): Observable<User[]> {
    return this.http.get<User[]>(this.API_URL + this.controller + '?id_site=' + idSite);
  }

  getByProject(idProject: number): Observable<User[]> {
    return this.http.get<User[]>(this.API_URL + this.controller + '?id_project=' + idProject);
  }

  update(user: User): Observable<User[]> {
    return this.http.post<User[]>(this.API_URL + this.controller, {user});
  }

  delete(idUser: number): Observable<any> {
    return this.http.delete(this.API_URL + this.controller + '?id=' + idUser);
  }
}
