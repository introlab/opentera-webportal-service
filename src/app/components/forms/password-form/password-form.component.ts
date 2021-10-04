import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ParentErrorStateMatcher} from '@core/utils/error-state-matcher';
import {BehaviorSubject} from 'rxjs';

@Component({
  selector: 'app-password-form',
  templateUrl: './password-form.component.html',
  styleUrls: ['./password-form.component.scss']
})
export class PasswordFormComponent implements OnInit, OnDestroy {
  @Output() passwordChange = new EventEmitter<string>();
  form: FormGroup;
  parentErrorStateMatcher = new ParentErrorStateMatcher();
  // private regex = '^(?=(?:\\D*\\d){2}).{8,}$';
  private regex = '(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\\W)(.{10,})$';
  private idParticipantSubject = new BehaviorSubject<number>(0);
  @Input() parentForm: FormGroup;

  @Input() set idAccount(value: number) {
    this.idParticipantSubject.next(value);
  }

  get idAccount(): number {
    return this.idParticipantSubject.getValue();
  }

  constructor(private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.initializeForm();
    this.idParticipantSubject.subscribe(res => {
      if (!res) {
        this.form.controls.password.setValidators([Validators.required, Validators.pattern(this.regex)]);
      } else {
        this.form.controls.password.setValidators([Validators.pattern(this.regex)]);
      }
      this.parentForm.addControl('password', this.form);
    });
  }

  ngOnDestroy(): void {
    this.idParticipantSubject.unsubscribe();
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      password: new FormControl('', Validators.pattern(this.regex)),
      confirmPassword: new FormControl(''),
    }, {validators: this.checkPasswords});
  }

  checkPasswords(formGroup: FormGroup): { passwordNotMatch: true } {
    const {value: password} = formGroup.get('password');
    const {value: confirmPassword} = formGroup.get('confirmPassword');
    return password === confirmPassword ? null : {passwordNotMatch: true};
  }

  passwordIsWeak(): boolean {
    return this.form.controls.password.hasError('pattern');
  }

  passwordMatch(): boolean {
    return !this.form.hasError('passwordNotMatch');
  }

  passwordIsRequired(): boolean {
    return this.form.controls.password.hasError('required');
  }

  passwordChanged(): void {
    const password = this.form.controls.password.value;
    if (this.passwordMatch()) {
      this.passwordChange.emit(password);
    } else {
      this.passwordChange.emit(null);
    }
  }
}
