import {ChangeDetectorRef, Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {User} from '@shared/models/user.model';
import {ThemePalette} from '@angular/material/core';
import {GlobalConstants} from '@core/utils/global-constants';
import {AccountService} from '@services/account.service';
import {UserService} from '@services/user.service';
import {switchMap} from 'rxjs/operators';
import {Subscription} from 'rxjs';
import {Account} from '@shared/models/account.model';
import {validateAllFields} from '@core/utils/validate-form';

@Component({
  selector: 'app-profile-form',
  templateUrl: './profile-form.component.html',
  styleUrls: ['./profile-form.component.scss']
})
export class ProfileFormComponent implements OnInit, OnDestroy {
  title = 'Profil';
  account: Account;
  profileForm: FormGroup;
  color: ThemePalette = 'primary';
  required = GlobalConstants.requiredMessage;
  canSave = false;
  private newPassword: string;
  private user: User;
  private subscriptions: Subscription[] = [];

  constructor(public dialogRef: MatDialogRef<ProfileFormComponent>,
              private fb: FormBuilder,
              private accountService: AccountService,
              private userService: UserService,
              private cdr: ChangeDetectorRef,
              @Inject(MAT_DIALOG_DATA) public data: User) {
  }

  ngOnInit(): void {
    this.initializeForm();
    this.checkFormChange();
    this.subscriptions.push(
      this.accountService.account$().pipe(
        switchMap((account) => {
          this.account = account;
          return this.userService.getById(account.login_id);
        })
      ).subscribe((user) => {
        this.user = user[0];
        this.setValues();
      })
    );
  }

  private checkFormChange(): void {
    this.subscriptions.push(this.profileForm.valueChanges.subscribe(() => {
      this.cdr.detectChanges();
      this.canSave = this.profileForm.dirty && !this.profileForm.invalid && !this.profileForm.controls.password.errors;
    }));
  }

  private initializeForm(): void {
    this.profileForm = this.fb.group({
      username: new FormControl({value: '', disabled: true}, Validators.required),
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
    });
  }

  private setValues(): void {
    this.profileForm.controls.username.setValue(this.user.user_username);
    this.profileForm.controls.firstName.setValue(this.user.user_firstname);
    this.profileForm.controls.lastName.setValue(this.user.user_lastname);
    this.profileForm.controls.email.setValue(this.user.user_email);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.profileForm.invalid) {
      validateAllFields(this.profileForm);
      return;
    }
    if (this.canSave) {
      this.dialogRef.close(this.createUser());
    }
  }

  private createUser(): User {
    const temp = new User();
    const controls = this.profileForm.controls;
    temp.id_user = this.user.id_user;
    temp.user_email = controls.email.value;
    temp.user_firstname = controls.firstName.value;
    temp.user_lastname = controls.lastName.value;
    if (!!this.newPassword) {
      temp.user_password = this.newPassword;
    }
    return temp;
  }

  updatePassword(password: string): void {
    this.newPassword = password;
  }

  setParentControl(formGroup: FormGroup): void {
    this.profileForm = formGroup;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
