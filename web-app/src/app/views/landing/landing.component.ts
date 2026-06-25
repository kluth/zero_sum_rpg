import { Component, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="landing-container">
      <div class="login-card">
        <div class="login-header">
          <img src="https://ui-avatars.com/api/?name=Z+S&background=2563eb&color=fff&rounded=true" alt="Logo" class="logo-large">
          <h1>Welcome Back</h1>
          <p class="text-muted">Sign in to your Zero-Sum Workspace</p>
        </div>
        
        <form class="login-form">
          <div class="form-group">
            <label class="zs-label">Session Key</label>
            <input type="text" [(ngModel)]="sessionKey" name="key" class="zs-input" placeholder="e.g. ALPHA-9" autocomplete="off">
          </div>
          
          <div class="form-group">
            <label class="zs-label">Select Role</label>
            <div class="role-selector">
              <label class="role-option">
                <input type="radio" [(ngModel)]="role" name="role" value="gm">
                <div class="role-card">
                  <span class="role-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                  </span>
                  <span class="role-name">Administrator</span>
                </div>
              </label>
              <label class="role-option">
                <input type="radio" [(ngModel)]="role" name="role" value="player">
                <div class="role-card">
                  <span class="role-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  </span>
                  <span class="role-name">Agent</span>
                </div>
              </label>
              <label class="role-option">
                <input type="radio" [(ngModel)]="role" name="role" value="spectator">
                <div class="role-card">
                  <span class="role-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  </span>
                  <span class="role-name">Spectator</span>
                </div>
              </label>
            </div>
          </div>

          <button type="button" class="zs-btn w-full mt-4" style="padding: 14px; font-size: 16px;" (click)="join()">
            Sign In
          </button>
        </form>

        <div class="login-footer">
          <p class="text-muted" style="font-size: 12px; margin-top: 24px;">Secure connection via Zero-Sum Network</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .landing-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: var(--bg-color);
      background-image: radial-gradient(#e5e7eb 1px, transparent 1px);
      background-size: 20px 20px;
    }

    .login-card {
      background: var(--surface-color);
      border: 1px solid var(--surface-border);
      border-radius: 16px;
      padding: 40px;
      width: 100%;
      max-width: 480px;
      box-shadow: var(--shadow-lg);
    }

    .login-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .logo-large {
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      border-radius: 16px;
    }

    .login-header h1 {
      font-size: 24px;
      margin-bottom: 8px;
    }

    .form-group {
      margin-bottom: 24px;
    }

    .role-selector {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }

    .role-option input {
      display: none;
    }

    .role-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16px 8px;
      border: 1px solid var(--surface-border);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      background: #f9fafb;
    }

    .role-option input:checked + .role-card {
      border-color: var(--primary-color);
      background: #eff6ff;
      box-shadow: 0 0 0 1px var(--primary-color);
    }

    .role-icon {
      font-size: 24px;
      margin-bottom: 8px;
    }

    .role-name {
      font-size: 12px;
      font-weight: 500;
      color: var(--text-main);
    }

    .login-footer {
      text-align: center;
    }
  `]
})
export class LandingComponent {
  sessionKey = '';
  role = 'player';

  constructor(private router: Router, private ngZone: NgZone) {}

  join() {
    if (!this.sessionKey.trim()) return;
    this.ngZone.run(() => {
      localStorage.setItem('zero_sum_token', this.sessionKey.trim());
      this.router.navigate(['/' + this.role]);
    });
  }
}
