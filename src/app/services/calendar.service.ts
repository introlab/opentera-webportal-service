import {Injectable} from '@angular/core';
import {makeApiURL} from '@core/utils/make-api-url';
import {BehaviorSubject, Observable} from 'rxjs';
import {Event} from '@shared/models/event.model';
import {HttpClient} from '@angular/common/http';
import {shareReplay, tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private API_URL = makeApiURL(true);
  private controller = 'calendar';
  private events: Event[] = [];
  private eventSubject: BehaviorSubject<Event> = new BehaviorSubject<Event>(new Event());
  private eventsSubject: BehaviorSubject<Event[]> = new BehaviorSubject<Event[]>([]);

  constructor(private http: HttpClient) {
  }

  event$(): Observable<Event> {
    return this.eventSubject.asObservable().pipe(shareReplay(1));
  }

  events$(): Observable<Event[]> {
    return this.eventsSubject.asObservable().pipe(shareReplay(1));
  }

  getCalendar(start: string, end: string, participantsUUIDs: string[] = []): Observable<Event[]> {
    let UUIDs = '';
    participantsUUIDs.forEach((uuid) => {
      UUIDs += '&participant_uuid=' + uuid;
    });
    const filter = `?full=true&start_date=${start}&end_date=${end}${UUIDs}`;
    return this.http.get<Event[]>(this.API_URL + this.controller + filter).pipe(
      tap((events) => {
        this.events = events;
        this.eventsSubject.next(events);
      })
    );
  }

  getFromId(id: number): Observable<Event[]> {
    const filter = `?full=true&id_event=${id}`;
    return this.http.get<Event[]>(this.API_URL + this.controller + filter).pipe(
      tap((event) => {
        this.eventSubject.next(event[0]);
      })
    );
  }

  update(event: Event): Observable<Event[]> {
    return this.http.post<Event[]>(this.API_URL + this.controller, {event}).pipe(
      tap((result) => {
        const updatedEvent: Event = result[0];
        event.id_event = updatedEvent.id_event;
        if (event.id_event > 0) {
          const index = this.events.findIndex(t => t.id_event === event.id_event);
          this.events[index] = event;
          this.events = [...this.events];
        } else {
          this.events = [...this.events, event];
        }
        this.eventsSubject.next(this.events);
      })
    );
  }

  delete(idEvent: number): Observable<any> {
    return this.http.delete(this.API_URL + this.controller + '?id=' + idEvent).pipe(
      tap(() => {
        this.events = this.events.filter(t => t.id_event !== idEvent);
        this.eventsSubject.next(this.events);
      })
    );
  }

  checkOverlaps(isoStartDate: string, isoEndDate: string, participantsUUIDs: string[] = []): Observable<Event[]> {
    let UUIDs = '';
    participantsUUIDs.forEach((uuid) => {
      UUIDs += '&participant_uuid=' + uuid;
    });
    const args = `?overlaps=true&start_date=${isoStartDate}&end_date=${isoEndDate}${UUIDs}`;
    return this.http.get<Event[]>(this.API_URL + this.controller + args);
  }

  getNextThree(participantsUUIDs: string[] = []): Observable<Event[]> {
    let UUIDs = '';
    participantsUUIDs.forEach((uuid) => {
      UUIDs += '&participant_uuid=' + uuid;
    });
    const filter = `?full=true&three=true${UUIDs}`;
    return this.http.get<Event[]>(this.API_URL + this.controller + filter);
  }
}
