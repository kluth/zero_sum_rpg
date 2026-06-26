import { Injectable, NgZone } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, onChildAdded, push, connectDatabaseEmulator } from 'firebase/database';

export interface FeedMessage {
  id: string;
  network: string;
  content: string;
  timestamp: Date;
  metadata?: any;
}

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FeedService {
  private messagesSubject = new Subject<FeedMessage>();
  private db: any;
  private sessionId: string;

  constructor(private zone: NgZone) {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const rawToken = localStorage.getItem('zero_sum_token');
      // Validate token: Must be alphanumeric/UUID format (no strange injections)
      if (rawToken && /^[a-zA-Z0-9\-_]+$/.test(rawToken)) {
         this.sessionId = rawToken;
      } else {
         this.sessionId = 'demo';
      }
      
      const app = getApps().length === 0 ? initializeApp(environment.firebaseConfig) : getApp();
      this.db = getDatabase(app);

      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        try {
          connectDatabaseEmulator(this.db, 'localhost', 9000);
        } catch (e) {}
      }

      console.log('[FeedService] Connecting to Firebase Realtime Database for Session:', this.sessionId);

      // Handle Online/Offline Status Resiliency
      const connectedRef = ref(this.db, '.info/connected');
      onChildAdded(connectedRef, (snap) => {
        if (snap.val() === true) {
          console.log('[FeedService] Firebase connection ESTABLISHED.');
        } else {
          console.warn('[FeedService] Firebase connection LOST. Attempting cache fallback.');
        }
      });
      
      const feedRef = ref(this.db, `sessions/${this.sessionId}/feed`);
      onChildAdded(feedRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          this.zone.run(() => {
            this.pushMessage({
              id: snapshot.key || Date.now().toString(),
              network: data.network,
              content: data.content,
              timestamp: new Date(data.timestamp),
              metadata: data.priority
            });
          });
        }
      });
    } else {
      this.sessionId = 'demo';
    }
  }

  streamMessages(): Observable<FeedMessage> {
    return this.messagesSubject.asObservable();
  }

  pushMessage(msg: FeedMessage) {
    this.messagesSubject.next(msg);
  }

  injectMessage(network: string, content: string, priority: string) {
    if (!this.db) return Promise.reject('DB not initialized');
    const feedRef = ref(this.db, `sessions/${this.sessionId}/feed`);
    return push(feedRef, {
      network,
      content,
      priority,
      timestamp: Date.now()
    });
  }
}
