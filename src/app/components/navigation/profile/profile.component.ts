import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '@services/authentication.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  initial = '';
  username = 'username';

  constructor(private authService: AuthenticationService) {
  }

  ngOnInit(): void {
    this.initial = this.username.charAt(0);
  }

  logout(): void {
    this.authService.logOut().subscribe();
  }
}
