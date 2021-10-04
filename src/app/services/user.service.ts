import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {makeApiURL} from '@core/utils/make-api-url';
import {User} from '@shared/models/user.model';
import {shareReplay, tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private API_URL = makeApiURL();
  private controller = 'user/users';
  private users: User[] = [];
  private usersSubject: BehaviorSubject<User[]> = new BehaviorSubject<User[]>([]);

  constructor(private http: HttpClient) {
  }

  users$(): Observable<User[]> {
    return this.usersSubject.asObservable().pipe(shareReplay(1));
  }

  getById(id: number): Observable<User[]> {
    return this.http.get<User[]>(this.API_URL + this.controller + '?with_usergroups=true&id_user=' + id);
  }

  getByUsername(username: string): Observable<User[]> {
    return this.http.get<User[]>(this.API_URL + this.controller + '?username=' + username);
  }

  getBySite(idSite: number): Observable<User[]> {
    return this.http.get<User[]>(this.API_URL + this.controller + '?id_site=' + idSite).pipe(
      tap((result) => {
        this.users = result;
        this.usersSubject.next(this.users);
      })
    );
  }

  getByProject(idProject: number): Observable<User[]> {
    return this.http.get<User[]>(this.API_URL + this.controller + '?id_project=' + idProject).pipe(
      tap((result) => {
        this.users = result;
        this.usersSubject.next(this.users);
      })
    );
  }

  update(user: User): Observable<User[]> {
    return this.http.post<User[]>(this.API_URL + this.controller, {user}).pipe(
      tap((result) => {
        const updatedUser: User = result[0];
        if (user.id_user > 0) {
          const index = this.users.findIndex(t => t.id_user === user.id_user);
          this.users[index] = updatedUser;
          this.users = [...this.users];
        } else {
          user.id_user = updatedUser.id_user;
          this.users = [...this.users, user];
        }
        this.usersSubject.next(this.users);
      })
    );
  }

  delete(idUser: number): Observable<any> {
    return this.http.delete(this.API_URL + this.controller + '?id=' + idUser).pipe(
      tap(() => {
        this.users = this.users.filter(t => t.id_user !== idUser);
        this.usersSubject.next(this.users);
      })
    );
  }
}
