import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface FeedMessage {
  id: string;
  network: string;
  content: string;
  timestamp: Date;
  metadata?: any;
}

@Injectable({
  providedIn: 'root'
})
export class FeedService {
  private messagesSubject = new Subject<FeedMessage>();

  constructor() {
    // Simulated gRPC-Web connection
  }

  streamMessages(): Observable<FeedMessage> {
    return this.messagesSubject.asObservable();
  }

  pushMessage(msg: FeedMessage) {
    this.messagesSubject.next(msg);
  }
}
