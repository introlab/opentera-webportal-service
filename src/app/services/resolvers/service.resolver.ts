import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {Service} from '@shared/models/service.model';
import {Observable, throwError} from 'rxjs';
import {catchError, map, shareReplay, tap} from 'rxjs/operators';
import {ServiceService} from '@services/service.service';

@Injectable({
  providedIn: 'root'
})
export class ServiceResolver implements Resolve<Service[]> {
  private service: Service = undefined;

  constructor(private serviceService: ServiceService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Service[]> {
    return this.serviceService.getByKey().pipe(
      tap((dataFromApi) => {
        this.service = dataFromApi[0];
      }),
      shareReplay(1),
      map((dataFromApi) => dataFromApi),
      catchError((err) => throwError(err))
    );
  }
}
