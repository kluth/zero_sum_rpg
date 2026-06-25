import { Injectable, NgZone } from '@angular/core';
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

  constructor(private zone: NgZone) {
    console.log('[FeedService] Connecting to Live Backend SSE stream...');
    const token = localStorage.getItem('zero_sum_token') || '';
    const eventSource = new EventSource(`http://localhost:8080/events?token=${token}`);

    eventSource.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        console.log('[FeedService] Received live event:', msg);
        this.zone.run(() => {
          this.pushMessage(msg);
        });
      } catch (e) {
        console.error('[FeedService] Failed to parse SSE event', e);
      }
    };

    eventSource.onerror = (error) => {
      console.error('[FeedService] SSE Connection error:', error);
    };
  }

  streamMessages(): Observable<FeedMessage> {
    return this.messagesSubject.asObservable();
  }

  pushMessage(msg: FeedMessage) {
    this.messagesSubject.next(msg);
  }
}
