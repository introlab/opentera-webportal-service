import {Injectable} from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class WebsocketService {
  private websocket$: WebSocketSubject<any>;

  constructor() { }

  connect(url: string): Observable<any> {
    console.log('Connecting websocket on ' + url);
    if (this.websocket$) {
      console.log('Returning existing websocket.');
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
  onData(data: string): void {
    console.log('Websocket data received: ' + JSON.stringify(data));
  }
}
