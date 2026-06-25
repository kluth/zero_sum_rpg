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
          <label>ACCESS KEY:</label>
          <input type="text" [(ngModel)]="sessionKey" 
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
