import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WhispernetComponent } from '../../ui/whispernet/whispernet.component';
import { FrequenzXComponent } from '../../ui/frequenz-x/frequenz-x.component';
import { NeonLotusComponent } from '../../ui/neon-lotus/neon-lotus.component';
import { Observable, interval } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-player-view',
  standalone: true,
  imports: [CommonModule, WhispernetComponent, FrequenzXComponent, NeonLotusComponent],
  template: `
  <div class="modern-dashboard">
    <header class="top-nav">
      <div class="branding">
        <img src="https://ui-avatars.com/api/?name=Z+S&background=2563eb&color=fff&rounded=true" alt="Logo" class="logo">
        <span class="brand-name">Zero-Sum Workspace</span>
      </div>
      <div class="time">{{ time$ | async | date:'HH:mm' }}</div>
      <div class="user-profile">
        <img src="https://i.pravatar.cc/150?img=32" alt="Agent Profile" class="avatar">
        <div class="user-info">
          <span class="user-name">Alex Chen</span>
          <span class="user-role">Field Agent</span>
        </div>
      </div>
    </header>

    <div class="dashboard-content">
      <aside class="sidebar">
        <div class="clean-panel widget">
          <h3>Health & Status</h3>
          <img src="https://picsum.photos/300/150?grayscale" alt="Heart Rate Monitor" class="widget-img" style="border-radius:8px; margin: 10px 0; width:100%;">
          <div class="progress-container">
            <div class="progress-label"><span>Vitals</span> <span>96%</span></div>
            <div class="progress-bar"><div class="progress-fill" style="width: 96%; background: var(--success-green);"></div></div>
          </div>
        </div>
        <div class="clean-panel widget" style="flex: 1;">
          <h3>Location Map</h3>
          <img src="https://picsum.photos/300/300?blur=2" alt="Map" class="widget-img" style="border-radius:8px; margin-top: 10px; width:100%; height: 100%; object-fit: cover;">
        </div>
      </aside>

      <main class="main-area">
        <div class="clean-panel module">
          <div class="module-header">
            <h3>Direct Messages</h3>
            <span class="badge">Secure</span>
          </div>
          <app-whispernet></app-whispernet>
        </div>

        <div class="clean-panel module">
          <div class="module-header">
            <h3>Team Frequencies</h3>
          </div>
          <app-frequenz-x></app-frequenz-x>
        </div>
      </main>
    </div>
  </div>
  `
})
export class PlayerViewComponent implements OnInit {
  time$: Observable<Date> = new Observable();
  ngOnInit() {
    this.time$ = interval(1000).pipe(map(() => new Date()));
  }
}
