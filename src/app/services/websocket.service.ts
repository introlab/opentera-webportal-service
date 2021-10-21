import {Injectable, OnDestroy} from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import {Observable, Subject, throwError} from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class WebsocketService implements OnDestroy {
  private websocket$: WebSocketSubject<any>;
  websocketData = new Subject();

  constructor() { }

  ngOnDestroy(): void {
    if (this.websocket$){
      this.websocket$.unsubscribe();
      delete this.websocket$;
    }
    console.log('WebsocketService destroyed');
  }

  connect(url: string): Observable<any> {
    console.log('Connecting websocket$ on ' + url);
    if (this.websocket$) {
      console.log('Returning existing websocket$.');
      return this.websocket$;
    }
    this.websocket$ = webSocket(url);
    this.websocket$
      .subscribe(
        (msg) => {
          this.onData(msg);
        },
        (error) => {
          this.onError(error);
        },
        () => {
          this.onClose();
        }
      );
    return this.websocket$;
  }

  close(): void {
    console.log('Websocket closing request.');
    if (this.websocket$) {
      this.websocket$.complete();
      delete this.websocket$;
    }
  }

  onError(err: string): void {
    console.error('Websocket error: ' + err);
  }

  onClose(): void {
    console.log('Websocket closed');
    if (this.websocket$){
      delete this.websocket$;
    }
  }

  onData(data: any): void {
    console.log('Websocket data received: ' + JSON.stringify(data));
    if (!data.message){
      console.error('Websocket data: unknown format - missing message section');
      throwError('Websocket data: unknown format - missing message section');
    }
    const msg_data = data.message.events[0];

    this.websocketData.next(msg_data);
  }
}
