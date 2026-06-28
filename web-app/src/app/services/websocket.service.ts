import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Observable } from 'rxjs';

export interface DashboardEvent {
  type: string;
  payload: any;
}

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket$: WebSocketSubject<DashboardEvent>;
  private readonly WS_ENDPOINT = 'ws://localhost:8080/ws';

  constructor() {
    this.socket$ = webSocket(this.WS_ENDPOINT);
  }

  public getMessages(): Observable<DashboardEvent> {
    return this.socket$.asObservable();
  }
}
