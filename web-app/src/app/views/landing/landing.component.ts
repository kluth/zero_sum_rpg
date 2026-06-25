import { Component, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="display:flex; justify-content:center; items-center:center; min-height:100vh; background:black; color:#00ff00; font-family:monospace; align-items:center;">
      <div style="border: 2px solid #00ff00; padding: 40px; width: 400px; text-align: center; box-shadow: 0 0 20px #00ff00;">
        <h1 style="margin-bottom: 30px; font-size: 24px;">ZERO-SUM RPG<br>UPLINK TERMINAL</h1>
        
        <div style="margin-bottom: 20px; text-align: left;">
          <label>SERVER URL:</label>
          <input type="text" [(ngModel)]="serverUrl" 
                 style="width: 100%; padding: 10px; background: #111; color: #00ff00; border: 1px solid #00ff00; margin-top: 5px;">
        </div>

        <div style="margin-bottom: 20px; text-align: left;">
          <label>ACCESS KEY:</label>
          <input type="password" [(ngModel)]="sessionKey" 
                 style="width: 100%; padding: 10px; background: #111; color: #00ff00; border: 1px solid #00ff00; margin-top: 5px;">
        </div>

        <div style="margin-bottom: 30px; text-align: left;">
          <label>SELECT ROLE:</label>
          <select [(ngModel)]="selectedRole" style="width: 100%; padding: 10px; background: #111; color: #00ff00; border: 1px solid #00ff00; margin-top: 5px;">
            <option value="player">Player Agent (UI)</option>
            <option value="gm">Game Master (Overseer)</option>
            <option value="spectator">Spectator (Billboard)</option>
          </select>
        </div>

        <button (click)="login()" 
                style="width: 100%; padding: 15px; background: #00ff00; color: black; border: none; font-weight: bold; cursor: pointer;">
          ESTABLISH UPLINK
        </button>

        <div *ngIf="error" style="color: red; margin-top: 15px;">{{ error }}</div>
      </div>
    </div>
  `
})
export class LandingComponent {
  serverUrl = 'http://localhost:8080';
  sessionKey = '';
  selectedRole = 'player';
  error = '';

  constructor(private router: Router, private ngZone: NgZone) {
    if (typeof localStorage !== 'undefined') {
      const savedUrl = localStorage.getItem('zero_sum_server_url');
      if (savedUrl) this.serverUrl = savedUrl;
    }
  }

  login() {
    this.error = 'Connecting...';
    
    // Ensure URL has no trailing slash
    const targetUrl = this.serverUrl.endsWith('/') ? this.serverUrl.slice(0, -1) : this.serverUrl;

    fetch(targetUrl + '/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionKey: this.sessionKey })
    })
    .then(res => {
      this.ngZone.run(() => {
        if (res.ok) {
          localStorage.setItem('zero_sum_server_url', targetUrl);
          localStorage.setItem('zero_sum_token', this.sessionKey);
          this.router.navigate(['/' + this.selectedRole]);
        } else {
          this.error = 'ACCESS DENIED. INVALID KEY.';
        }
      });
    })
    .catch(err => {
      this.ngZone.run(() => {
        this.error = 'UPLINK FAILURE. SERVER UNREACHABLE.';
      });
    });
  }
}
