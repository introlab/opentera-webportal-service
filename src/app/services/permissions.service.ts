import {Injectable} from '@angular/core';
import {makeApiURL} from '@core/utils/make-api-url';
import {BehaviorSubject, Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {shareReplay, tap} from 'rxjs/operators';
import {Permission} from '@shared/models/permission.model';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {
  private API_URL = makeApiURL(true);
  private permissions: Permission = new Permission();
  private permissionSubject: BehaviorSubject<Permission> = new BehaviorSubject<Permission>(null);

  constructor(private http: HttpClient) {
    this.initializePermissions();
  }

  initializePermissions(): void {
    this.permissions.project_admin = false;
    this.permissions.site_admin = false;
    this.permissionSubject.next(this.permissions);
  }

  permissions$(): Observable<Permission> {
    return this.permissionSubject.asObservable().pipe(shareReplay(1));
  }

  getSitePermission(idSite: number): Observable<Permission> {
    const filter = `?id_site=${idSite}`;
    return this.http.get<Permission>(this.API_URL + 'permissions' + filter).pipe(
      tap((res) => {
        this.permissions.site_admin = res.site_admin;
        this.permissionSubject.next(this.permissions);
      })
    );
  }

  getProjectPermission(idProject: number): Observable<Permission> {
    const filter = `?id_project=${idProject}`;
    return this.http.get<Permission>(this.API_URL + 'permissions' + filter).pipe(
      tap((res) => {
        this.permissions.project_admin = res.project_admin;
        this.permissionSubject.next(this.permissions);
      })
    );
  }
}
