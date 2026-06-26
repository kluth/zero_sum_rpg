import { Injectable, signal } from '@angular/core';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, doc, onSnapshot, setDoc, addDoc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface GameSession {
  id?: string;
  name: string;
  gmId: string;
  status: 'lobby' | 'live' | 'ended';
  players: string[]; // array of UIDs
  createdAt: number;
}

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private db: any;
  public activeSessions = signal<GameSession[]>([]);

  constructor(private auth: AuthService) {
    if (typeof window !== 'undefined') {
      const app = getApps().length === 0 ? initializeApp(environment.firebaseConfig) : getApp();
      this.db = getFirestore(app);
      this.listenToSessions();
    }
  }

  private listenToSessions() {
    const sessionsRef = collection(this.db, 'community_sessions');
    onSnapshot(sessionsRef, (snapshot) => {
      const sessionsList: GameSession[] = [];
      snapshot.forEach((docSnap) => {
        sessionsList.push({ id: docSnap.id, ...docSnap.data() } as GameSession);
      });
      // Sort by creation time descending
      sessionsList.sort((a, b) => b.createdAt - a.createdAt);
      this.activeSessions.set(sessionsList);
    }, (error) => {
      console.error('[SessionService] Error listening to Firestore:', error);
    });
  }

  async createSession(name: string) {
    const user = this.auth.currentUser();
    if (!user) throw new Error('Must be logged in to create a session');
    
    const sessionsRef = collection(this.db, 'community_sessions');
    const docRef = await addDoc(sessionsRef, {
      name,
      gmId: user.uid,
      status: 'lobby',
      players: [],
      createdAt: Date.now()
    });
    return docRef.id;
  }

  async joinSession(sessionId: string) {
    const user = this.auth.currentUser();
    if (!user) throw new Error('Must be logged in to join as player');
    
    const sessionRef = doc(this.db, 'community_sessions', sessionId);
    await updateDoc(sessionRef, {
      players: arrayUnion(user.uid)
    });
  }

  async verifyAccess(sessionId: string, role: 'gm' | 'player'): Promise<boolean> {
    const user = this.auth.currentUser();
    if (!user) return false;

    const sessionRef = doc(this.db, 'community_sessions', sessionId);
    const snap = await getDoc(sessionRef);
    
    if (!snap.exists()) return false;
    
    const session = snap.data() as GameSession;
    
    if (role === 'gm') {
      return session.gmId === user.uid;
    } else {
      return session.players && session.players.includes(user.uid);
    }
  }
}
