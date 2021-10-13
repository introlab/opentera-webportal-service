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
    const startControl = control.get('startTime');
    const endControl = control.get('endTime');

    if (!startControl || !endControl) {
      return null;
    }

    const startTime = new Date(startControl.value);
    const endTime = new Date(endControl.value);

    if (startTime >= endTime) {
      startControl.setErrors({startTimeAfterEndTime: true});
      endControl.setErrors({startTimeAfterEndTime: true});
    } else {
      startControl.setErrors(null);
      endControl.setErrors(null);
    }
    return null;
  }

  public static checkIfTimeSlotsTaken(calendarService: CalendarService, uuidUser: string, eventId: number): any {
    if (uuidUser) {
      return (control: AbstractControl): Observable<ValidationErrors | null> => {
        const startControl = control.get('startTime');
        const endControl = control.get('endTime');

        if (!startControl || !endControl) {
          return null;
        }

        const startTime = new Date(startControl.value);
        const endTime = new Date(endControl.value);
        const isoStartDate = dateToISOLikeButLocal(startTime);
        const isoEndDate = dateToISOLikeButLocal(endTime);

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
