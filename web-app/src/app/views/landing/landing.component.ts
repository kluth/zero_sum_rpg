import { Component, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="crt-overlay"></div>
    <div class="flex-center" style="min-height: 100vh;">
      <div class="glass-panel" style="width: 420px; text-align: center;">
        <h1 style="margin-bottom: 30px; font-size: 28px;">ZERO-SUM RPG<br><span style="font-size: 16px; color: var(--text-muted);">UPLINK TERMINAL</span></h1>
        
        <div class="mb-4" style="text-align: left;">
          <label class="zs-label">ACCESS KEY</label>
          <input type="text" class="zs-input" [(ngModel)]="sessionKey" placeholder="Enter secure session ID...">
        </div>

        <div class="mb-4" style="text-align: left;">
          <label class="zs-label">SELECT ROLE</label>
          <select class="zs-select" [(ngModel)]="selectedRole">
            <option value="player">Player Agent (UI)</option>
            <option value="gm">Game Master (Overseer)</option>
            <option value="spectator">Spectator (Billboard)</option>
          </select>
        </div>

        <button class="zs-btn w-full mt-4" (click)="login()">
          ESTABLISH UPLINK
        </button>

        <div *ngIf="error" class="text-alert mt-4" style="font-weight: 600;">{{ error }}</div>
      </div>
    </div>
  `
})
export class LandingComponent {
  sessionKey = '';
  selectedRole = 'player';
  error = '';

  constructor(private router: Router, private ngZone: NgZone) {}

  login() {
    if (!this.sessionKey.trim()) {
      this.error = 'ACCESS KEY REQUIRED.';
      return;
    }
    this.error = 'Connecting...';
    
    this.ngZone.run(() => {
      localStorage.setItem('zero_sum_token', this.sessionKey.trim());
      this.router.navigate(['/' + this.selectedRole]);
    });
  }
}
