import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UiStateService } from '../../services/ui-state.service';
import { AuthService } from '../../services/auth.service';
import { SessionService, GameSession } from '../../services/session.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="lobby-container" [class.theme-terminal]="uiState.currentTheme() === 'terminal'">
      <div class="lobby-header">
        <h1 class="glitch-text" data-text="ZERO-SUM NEXUS">ZERO-SUM NEXUS</h1>
        <p class="subtitle">Global Operations Lobby</p>
        <div style="position: absolute; right: 24px; top: 24px; display: flex; gap: 10px;">
          <button class="zs-btn" (click)="router.navigate(['/mission-map'])">Tactical Map</button>
          <button class="zs-btn" (click)="uiState.toggleTheme()">Toggle Theme</button>
        </div>
      </div>

      <div class="lobby-grid">
        <!-- Auth Panel -->
        <div class="clean-panel auth-panel">
          <div class="panel-header">Agent Authentication</div>
          
          <div *ngIf="!authLoaded" class="loading">Establishing connection...</div>
          
          <div *ngIf="authLoaded && !currentUser" class="auth-form">
            <p style="margin-bottom: 16px; font-size: 14px; color: var(--text-muted)">Login or register to participate as GM or Player.</p>
            <input type="email" [(ngModel)]="email" class="zs-input mb-4" placeholder="Agent Email (e.g. agent@0sum.net)">
            <input type="password" [(ngModel)]="password" class="zs-input mb-4" placeholder="Clearance Code (Password)">
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button class="zs-btn" style="flex: 1" (click)="login()">Login</button>
              <button class="zs-btn zs-btn-secondary" style="flex: 1" (click)="register()">Register</button>
            </div>
            <button class="zs-btn mt-2" style="width: 100%; background: white; color: #333; border: 1px solid #ccc; display: flex; align-items: center; justify-content: center; gap: 8px;" (click)="loginWithGoogle()">
              <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.73 17.74 9.5 24 9.5z"></path><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path></svg>
              Sign in with Google
            </button>
            <p class="error-text" *ngIf="authError">{{ authError }}</p>
          </div>

          <div *ngIf="authLoaded && currentUser" class="auth-success">
            <div class="user-badge">
              <span class="status-dot"></span>
              <span class="user-email">Logged in as: {{ currentUser.email }}</span>
            </div>
            <button class="zs-btn zs-btn-secondary mt-4 w-full" (click)="logout()">Terminate Session</button>
            
            <div class="create-session-box mt-4">
              <h3 style="font-size: 14px; margin-bottom: 8px; color: var(--primary-color)">Create Operation</h3>
              <input type="text" [(ngModel)]="newSessionName" class="zs-input mb-4" placeholder="Operation Codename">
              <button class="zs-btn w-full" (click)="createSession()">Initialize Session</button>
            </div>
          </div>
        </div>

        <!-- Active Sessions Panel -->
        <div class="clean-panel sessions-panel">
          <div class="panel-header">Active Operations</div>
          
          <div *ngIf="sessions.length === 0" class="empty-state">
            No active operations on the network.
          </div>

          <div class="session-list">
            <div *ngFor="let s of sessions" class="session-card">
              <div class="session-info">
                <h3>{{ s.name || 'Classified Op' }}</h3>
                <span class="session-id">ID: {{ s.id }}</span>
              </div>
              <div class="session-actions">
                <button class="zs-btn spec-btn" (click)="joinAsSpectator(s.id!)">Spectate</button>
                <button class="zs-btn join-btn" *ngIf="currentUser" (click)="joinAsPlayer(s.id!)">Join as Agent</button>
                <button class="zs-btn gm-btn" *ngIf="currentUser && s.gmId === currentUser.uid" (click)="joinAsGM(s.id!)">Admin Override</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  uiState = inject(UiStateService);
  auth = inject(AuthService);
  sessionService = inject(SessionService);
  router = inject(Router);

  email = '';
  password = '';
  authError = '';
  newSessionName = '';

  get currentUser() { return this.auth.currentUser(); }
  get authLoaded() { return this.auth.isAuthLoaded(); }
  get sessions() { return this.sessionService.activeSessions(); }

  ngOnInit() {
    this.uiState.setTheme('corporate');
  }

  async login() {
    this.authError = '';
    try {
      await this.auth.login(this.email, this.password);
    } catch(e: any) {
      this.authError = e.message;
    }
  }

  async register() {
    this.authError = '';
    try {
      await this.auth.register(this.email, this.password);
    } catch(e: any) {
      this.authError = e.message;
    }
  }

  async loginWithGoogle() {
    this.authError = '';
    try {
      await this.auth.loginWithGoogle();
    } catch(e: any) {
      this.authError = e.message;
    }
  }

  async logout() {
    await this.auth.logout();
  }

  async createSession() {
    if (!this.newSessionName) return;
    try {
      await this.sessionService.createSession(this.newSessionName);
      this.newSessionName = '';
    } catch(e: any) {
      alert(e.message);
    }
  }

  async joinAsPlayer(sessionId: string) {
    if (!this.currentUser) return alert('Login required');
    try {
      await this.sessionService.joinSession(sessionId);
      this.router.navigate(['/player', sessionId]);
    } catch(e: any) {
      alert(e.message);
    }
  }

  joinAsGM(sessionId: string) {
    this.router.navigate(['/gm', sessionId]);
  }

  joinAsSpectator(sessionId: string) {
    this.router.navigate(['/spectator', sessionId]);
  }
}
