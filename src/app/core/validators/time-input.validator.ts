import {AbstractControl, ValidationErrors} from '@angular/forms';
import {Observable} from 'rxjs';
import {debounceTime, map, switchMap} from 'rxjs/operators';
import {dateToISOLikeButLocal} from '@core/utils/utility-functions';
import {CalendarService} from '@services/calendar.service';
import {Event} from '@shared/models/event.model';
import {AccountService} from '@services/account.service';

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

  public static checkIfTimeSlotsTaken(accountService: AccountService, calendarService: CalendarService, eventId: number): any {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const startControl = control.get('startTime');
      const endControl = control.get('endTime');
      const clinicianControl = control.get('clinician');

      if (!startControl || !endControl) {
        return null;
      }

      const startTime = new Date(startControl.value);
      const endTime = new Date(endControl.value);
      const isoStartDate = dateToISOLikeButLocal(startTime);
      const isoEndDate = dateToISOLikeButLocal(endTime);
      const clinician = clinicianControl.value;

      return accountService.account$()
        .pipe(
          switchMap((account) => {
            let userUUID = '';
            clinician && account.login_uuid === clinician.user_uuid ? userUUID = '' : userUUID = clinician.user_uuid;
            return calendarService.checkOverlaps(isoStartDate, isoEndDate, [], userUUID);
          }),
          debounceTime(200),
          map((data: Event[]) => {
            data = data.filter(x => {
              return x.id_event !== eventId;
            });
            return data && data.length > 0 ? {timesOverlapping: true} : null;
          })
        );
    };
  }
}

