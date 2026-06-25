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

const firebaseConfig = {
  projectId: "zero-sum-rpg-2026",
  appId: "1:941946145190:web:89539148cced56ecf42767",
  storageBucket: "zero-sum-rpg-2026.firebasestorage.app",
  apiKey: "AIzaSyCAPKXPuhtVJ48dXIP5ZlEXk5jI_3fpWd0",
  authDomain: "zero-sum-rpg-2026.firebaseapp.com",
  messagingSenderId: "941946145190",
  databaseURL: "https://zero-sum-rpg-2026-default-rtdb.europe-west1.firebasedatabase.app"
};

@Injectable({
  providedIn: 'root'
})
export class FeedService {
  private messagesSubject = new Subject<FeedMessage>();
  private db: any;
  private sessionId: string;

  constructor(private zone: NgZone) {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      this.sessionId = (localStorage.getItem('zero_sum_token') || 'demo').replace(/[\.#\$\[\]\/]/g, '_');
      
      const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
      this.db = getDatabase(app);

      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        try {
          connectDatabaseEmulator(this.db, 'localhost', 9000);
        } catch (e) {
          // Suppress error if already connected
        }
      }

      console.log('[FeedService] Connecting to Firebase Realtime Database for Session:', this.sessionId);
      
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
