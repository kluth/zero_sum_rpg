import { Injectable, NgZone } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, onChildAdded, push, connectDatabaseEmulator, off } from 'firebase/database';
import { environment } from '../../environments/environment';

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
  private messagesSubject = new ReplaySubject<FeedMessage>(50);
  private db: any;
  private sessionId: string | null = null;
  private currentFeedRef: any = null;

  constructor(private zone: NgZone) {
    if (typeof window !== 'undefined') {
      const app = getApps().length === 0 ? initializeApp(environment.firebaseConfig) : getApp();
      this.db = getDatabase(app);
      
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        try {
          connectDatabaseEmulator(this.db, 'localhost', 9000);
        } catch (e) {}
      }

      const connectedRef = ref(this.db, '.info/connected');
      onChildAdded(connectedRef, (snap) => {
        if (snap.val() === true) {
          console.log('[FeedService] Firebase connection ESTABLISHED.');
        }
      });
    }
  }

  public connectToSession(sessionId: string) {
    if (this.sessionId === sessionId) return;
    this.sessionId = sessionId;
    
    // Reset subject for new session
    this.messagesSubject = new ReplaySubject<FeedMessage>(50);
    
    if (this.currentFeedRef) {
      off(this.currentFeedRef);
    }
    
    console.log('[FeedService] Connecting to feed for session:', sessionId);
    this.currentFeedRef = ref(this.db, `community_sessions/${this.sessionId}/feed`);
    
    onChildAdded(this.currentFeedRef, (snapshot) => {
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
  }

  streamMessages(): Observable<FeedMessage> {
    return this.messagesSubject.asObservable();
  }

  pushMessage(msg: FeedMessage) {
    this.messagesSubject.next(msg);
  }

  injectMessage(network: string, content: string, priority: string) {
    if (!this.db || !this.sessionId) return Promise.reject('DB or Session not initialized');
    const feedRef = ref(this.db, `community_sessions/${this.sessionId}/feed`);
    return push(feedRef, {
      network,
      content,
      priority,
      timestamp: Date.now()
    });
  }
}
