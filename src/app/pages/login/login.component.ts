import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthenticationService} from '@services/authentication.service';
import {Router} from '@angular/router';
import {GlobalConstants} from '@core/utils/global-constants';
import {LoginButtonService} from '@services/login-button.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  title = GlobalConstants.title;
  form!: FormGroup;
  loginInvalid = false;
  isButtonDisabled = true;
  version = GlobalConstants.version;
  organism = GlobalConstants.organism;
  private formSubmitAttempt = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private loginButtonService: LoginButtonService,
    private authService: AuthenticationService
  ) {
  }

  ngOnInit(): void {
    this.redirect();

    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.subscriptions.push(this.loginButtonService.isDisabled().subscribe((isDisabled) => {
      this.isButtonDisabled = isDisabled;
    }));

    this.subscriptions.push(this.form.valueChanges.subscribe(x => {
      if (this.isButtonDisabled) {
        this.loginButtonService.enableButton(false);
      }
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  private redirect(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate([GlobalConstants.homePage]);
    }
  }

  onSubmit(): void {
    this.loginInvalid = false;
    this.formSubmitAttempt = false;
    this.loginButtonService.enableButton(true);
    this.isButtonDisabled = true;
    if (this.form.valid) {
      try {
        const username = this.form.controls.username.value;
        const password = this.form.controls.password.value;
        this.authService.login(username, password, true).subscribe((res) => {
          this.loginButtonService.enableButton(false);
        });
      } catch (err) {
        this.loginInvalid = true;
      }
    } else {
      this.formSubmitAttempt = true;
    }
  }
}
