import {AbstractControl, ValidationErrors} from '@angular/forms';
import {Observable} from 'rxjs';
import {debounceTime, map} from 'rxjs/operators';
import {dateToISOLikeButLocal, setDate} from '@core/utils/utility-functions';
import {CalendarService} from '@services/calendar.service';
import {Event} from '@shared/models/event.model';
import {Participant} from '@shared/models/participant.model';

export class TimeInputValidator {

  constructor() {
  }

  public static validateTimes(control: AbstractControl): null {
    const startTime = control.get('startTime');
    const endTime = control.get('endTime');
    const start = new Date(startTime.value);
    const end = new Date(endTime.value);

    if (start.getHours() > end.getHours()) {
      startTime.setErrors({startTimeAfterEndTime: true});
      endTime.setErrors({startTimeAfterEndTime: true});
    } else if (start.getHours() === end.getHours() && start.getMinutes() >= end.getMinutes()) {
      startTime.setErrors({startTimeAfterEndTime: true});
      endTime.setErrors({startTimeAfterEndTime: true});
    } else {
      endTime.setErrors(null);
      startTime.setErrors(null);
    }
    return null;
  }

  public static checkIfTimeSlotsTaken(calendarService: CalendarService, uuidUser: string, eventId: number, participants: Participant[]): any {
    if ( participants.length > 0) {
      const participantsUUIDs: string[] = participants.map((participant) => participant.participant_uuid);
    }
    if (uuidUser) {
      return (control: AbstractControl): Observable<ValidationErrors | null> => {
        const startTime = new Date(control.get('startTime').value);
        const endTime = new Date(control.get('endTime').value);
        const date = new Date(control.get('startDate').value);
        const isoStartDate = dateToISOLikeButLocal(setDate(date, startTime));
        const isoEndDate = dateToISOLikeButLocal(setDate(date, endTime));
        return calendarService.checkOverlaps(isoStartDate, isoEndDate, [])
          .pipe(
            debounceTime(200),
            map((data: Event[]) => {
              data = data.filter(x => {
                return x.id_event !== eventId;
              });
              return data && data.length > 0 ? {timesOverlapping: true} : null;
            })
          );
      };
    } else {
      return null;
    }
  }
}
