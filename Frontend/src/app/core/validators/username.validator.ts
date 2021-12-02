import {AbstractControl, AsyncValidatorFn, Validators} from '@angular/forms';
import {Injectable} from '@angular/core';
import {UserService} from '@services/user.service';
import {ParticipantService} from '@services/participant/participant.service';

@Injectable()
export class UsernameValidator extends Validators {
  private debounce: any;

  constructor(private userService: UserService,
              private participantService: ParticipantService) {
    super();
  }

  checkParticipantUsername(idAccount: number): AsyncValidatorFn {
    clearTimeout(this.debounce);

    return (c: AbstractControl): Promise<unknown> => {
      return new Promise(resolve => {
        this.debounce = setTimeout(() => {
          this.participantService.getByUsername(c.value).subscribe((res) => {
            if (res.length === 0 || res[0].id_participant === idAccount) {
              resolve(null);
            } else {
              resolve({usernameTaken: true});
            }
          });
        }, 1000);
      });
    };
  }

  checkUserUsername(idAccount: number): AsyncValidatorFn {
    clearTimeout(this.debounce);

    return (c: AbstractControl): Promise<unknown> => {
      return new Promise(resolve => {
        this.debounce = setTimeout(() => {
          this.userService.getByUsername(c.value).subscribe((res) => {
            if (res.length === 0 || res[0].id_user === idAccount) {
              resolve(null);
            } else {
              resolve({usernameTaken: true});
            }
          });
        }, 1000);
      });
    };
  }
}
