import { Injectable, signal } from '@angular/core';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: any;
  public currentUser = signal<User | null>(null);
  public isAuthLoaded = signal<boolean>(false);

  constructor() {
    if (typeof window !== 'undefined') {
      const app = getApps().length === 0 ? initializeApp(environment.firebaseConfig) : getApp();
      this.auth = getAuth(app);
      
      onAuthStateChanged(this.auth, (user) => {
        this.currentUser.set(user);
        this.isAuthLoaded.set(true);
      });
    } else {
      this.isAuthLoaded.set(true);
    }
  }

  async login(email: string, pass: string) {
    return signInWithEmailAndPassword(this.auth, email, pass);
  }

  async register(email: string, pass: string) {
    return createUserWithEmailAndPassword(this.auth, email, pass);
  }

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider);
  }

  async logout() {
    return signOut(this.auth);
  }
}
