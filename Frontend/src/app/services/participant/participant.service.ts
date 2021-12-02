import {Injectable} from '@angular/core';
import {makeApiURL} from '@core/utils/make-api-url';
import {Participant} from '@shared/models/participant.model';
import {BehaviorSubject, Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {shareReplay, tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ParticipantService {
  private API_URL = makeApiURL();
  private controller = 'user/participants';

  private participants: Participant[] = [];
  private participantsSubject: BehaviorSubject<Participant[]> = new BehaviorSubject<Participant[]>([]);

  constructor(private http: HttpClient) {
  }

  participants$(): Observable<Participant[]> {
    return this.participantsSubject.asObservable().pipe(shareReplay(1));
  }

  getByProject(idProject: number): Observable<Participant[]> {
    return this.http.get<Participant[]>(this.API_URL + this.controller + '?full=true&id_project=' + idProject).pipe(
      tap((result) => {
        this.participants = result;
        this.participantsSubject.next(this.participants);
      })
    );
  }

  getByGroup(idGroup: number): Observable<Participant[]> {
    return this.http.get<Participant[]>(this.API_URL + this.controller + '?full=true&id_group=' + idGroup).pipe(
      tap((result) => {
        this.participants = result;
        this.participantsSubject.next(this.participants);
      })
    );
  }

  getByUsername(username: string): Observable<Participant[]> {
    return this.http.get<Participant[]>(this.API_URL + this.controller + '?username=' + username);
  }

  update(participant: Participant): Observable<Participant[]> {
    return this.http.post<Participant[]>(this.API_URL + this.controller, {participant}).pipe(
      tap((result) => {
        const updatedParticipant: Participant = result[0];
        if (participant.id_participant > 0) {
          const index = this.participants.findIndex(t => t.id_participant === participant.id_participant);
          this.participants[index] = updatedParticipant;
          this.participants = [...this.participants];
        } else {
          participant.id_participant = updatedParticipant.id_participant;
          this.participants = [...this.participants, participant];
        }
        this.participantsSubject.next(this.participants);
      })
    );
  }

  delete(idParticipant: number): Observable<any> {
    return this.http.delete(this.API_URL + this.controller + '?id=' + idParticipant).pipe(
      tap(() => {
        this.participants = this.participants.filter(t => t.id_participant !== idParticipant);
        this.participantsSubject.next(this.participants);
      })
    );
  }
}
