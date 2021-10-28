import {Injectable, OnDestroy} from '@angular/core';
import {WebsocketService} from '@services/websocket.service';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {delay, shareReplay, tap} from 'rxjs/operators';
import {Router, RouterEvent} from '@angular/router';
import {Pages} from '@core/utils/pages';
import {AccountService} from '@services/account.service';
import {SelectedSourceService} from '@services/selected-source.service';
import {SessionManager} from '@shared/models/session-manage.model';
import {makeApiURL} from '@core/utils/make-api-url';
import {HttpClient} from '@angular/common/http';
import {Account} from '@shared/models/account.model';

@Injectable({
  providedIn: 'root'
})

export class SessionManagerService implements OnDestroy {
  private websocketSub: Subscription;
  private API_URL = makeApiURL(false);
  private controller = 'user/sessions/manager';
  private current_session_uuid: string;
  private inSessionSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient,
              private accountService: AccountService,
              private webSocketService: WebsocketService,
              private selectedSourceService: SelectedSourceService,
              private router: Router) {
    this.websocketSub = this.webSocketService.websocketData.subscribe(data => this.webSocketMessage(data));
  }

  ngOnDestroy(): void {
    this.websocketSub.unsubscribe();
  }

  inSession$(): Observable<boolean> {
    return this.inSessionSubject.asObservable();
  }

  // Process websocket events
  webSocketMessage(msg_data: any): void {

    const msgType = msg_data['@type'];

    if (msgType === 'type.googleapis.com/opentera.protobuf.JoinSessionEvent'){
      console.log('Join session event');
      this.inSessionSubject.next(true);
      this.current_session_uuid = msg_data.sessionUuid;
      const fullname = this.accountService.getAccount().fullname;
      const current_session_url = msg_data.sessionUrl + '&name=' + fullname;
      this.selectedSourceService.setSelectedSource(current_session_url);
      this.router.navigate([Pages.createPath(Pages.appPage)]);
    }

    if (msgType === 'type.googleapis.com/opentera.protobuf.StopSessionEvent'){
      this.inSessionSubject.next(false);
      this.current_session_uuid = '';
      this.router.navigate([Pages.homePage]);
    }

  }

  stopSession(): Observable<any>{
    // Do a request to stop the session
    console.log('Stopping session...');
    const session_manager = new SessionManager();
    session_manager.action = 'stop';
    session_manager.session_uuid = this.current_session_uuid;

    return this.http.post(this.API_URL + this.controller, {session_manage: session_manager});
  }

}
