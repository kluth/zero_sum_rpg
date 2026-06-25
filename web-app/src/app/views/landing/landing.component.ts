import { Component, NgZone, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UiStateService } from '../../services/ui-state.service';

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
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  sessionKey = '';
  role = 'player';
  
  public uiState = inject(UiStateService);

  constructor(private router: Router, private ngZone: NgZone) {}

  ngOnInit() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('zero_sum_theme');
        localStorage.removeItem('remote_theme_override');
        const prevToken = localStorage.getItem('zero_sum_token');
        if (!prevToken) {
          localStorage.removeItem('zero_sum_stabilized');
          this.uiState.setStabilized(false);
        }
      }
    } catch (e) {
      console.error('Error clearing theme keys from localStorage:', e);
    }
    this.uiState.setTheme('corporate');
  }

  join() {
    if (!this.sessionKey.trim()) return;
    this.ngZone.run(() => {
      try {
        if (typeof localStorage !== 'undefined') {
          const prevToken = localStorage.getItem('zero_sum_token');
          const newToken = this.sessionKey.trim();
          if (prevToken && prevToken !== newToken) {
            localStorage.removeItem('zero_sum_stabilized');
            this.uiState.setStabilized(false);
            this.uiState.setTheme('corporate');
          }
          localStorage.setItem('zero_sum_token', newToken);
        }
      } catch (e) {
        console.error('Error handling session storage on join:', e);
      }
      this.router.navigate(['/' + this.role]);
    });
  }
}
