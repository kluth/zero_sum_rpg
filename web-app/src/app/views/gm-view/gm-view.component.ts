import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FeedService } from '../../services/feed.service';
import { UiStateService } from '../../services/ui-state.service';
import { OcgfComponent } from '../../ui/ocgf/ocgf.component';
import { WhispernetComponent } from '../../ui/whispernet/whispernet.component';
import { FrequenzXComponent } from '../../ui/frequenz-x/frequenz-x.component';

@Component({
  selector: 'app-gm-view',
  standalone: true,
  imports: [CommonModule, FormsModule, OcgfComponent, WhispernetComponent, FrequenzXComponent],
  styleUrls: ['./gm-view.component.scss'],
  template: `
<div class="modern-dashboard">
  <header class="top-nav">
    <div class="branding">
      <img src="https://ui-avatars.com/api/?name=GM&background=ef4444&color=fff&rounded=true" alt="GM Profile Avatar" class="logo">
      <span class="brand-name">Zero-Sum Admin Panel</span>
    </div>
    <div class="user-profile">
      <button data-test-id="theme-toggle" (click)="uiState.toggleTheme()" class="cyber-btn" style="margin-right: 16px; padding: 6px 12px; font-size: 11px;" aria-label="Toggle Theme">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
        Theme Shift
      </button>
      <div class="live-badge">
        <div class="pulse-dot"></div>
        Session Live
      </div>
      <div class="user-info">
        <span class="user-name">Overseer</span>
        <span class="user-role">System Administrator</span>
      </div>
    </div>
  </header>

  <div class="dashboard-content responsive-grid">
    <!-- Left Sidebar: Controls & Vitals -->
    <aside style="display: flex; flex-direction: column; gap: 24px;">
      <div class="glass-widget">
        <div class="widget-title">System Controls</div>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <button class="cyber-btn" (click)="broadcast()">
            <span>Global Broadcast</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
          </button>
          <button class="cyber-btn">
            <span>Trigger Event</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
          </button>
          <button class="cyber-btn">
            <span>Spawn NPC</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </button>
          <button class="cyber-btn cyber-btn-alert" style="margin-top: 8px;">
            <span>Emergency Shutdown</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>
          </button>
        </div>
      </div>
      
      <div class="glass-widget" style="flex: 1;">
        <div class="widget-title">Agent Overview</div>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div class="agent-card">
            <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px;">
              <strong style="color: var(--text-main);">Agent 01 (A. Chen)</strong> 
              <span style="color: var(--alert-red); font-weight: 600;">HR: 120</span>
            </div>
            <div class="vital-bar-container">
              <div class="vital-bar-fill" style="width: 96%; background: var(--success-green);"></div>
            </div>
          </div>
          <div class="agent-card">
            <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px;">
              <strong style="color: var(--text-main);">Agent 02 (J. Doe)</strong> 
              <span style="color: var(--text-muted); font-weight: 600;">HR: 85</span>
            </div>
            <div class="vital-bar-container">
              <div class="vital-bar-fill" style="width: 82%; background: var(--success-green);"></div>
            </div>
          </div>
          <div class="agent-card">
            <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px;">
              <strong style="color: var(--text-main);">Agent 03 (M. Smith)</strong> 
              <span style="color: var(--alert-red); font-weight: 700; animation: pulse-text 1s infinite;">HR: 140!</span>
            </div>
            <div class="vital-bar-container" style="box-shadow: 0 0 8px color-mix(in srgb, var(--alert-red) 50%, transparent);">
              <div class="vital-bar-fill" style="width: 45%; background: var(--alert-red);"></div>
            </div>
          </div>
        </div>
        
        <div class="widget-title" style="margin-top: 32px;">Tactical Global Map</div>
        <div class="tactical-map-container">
          <img src="https://picsum.photos/400/300?grayscale&blur=1" alt="Tactical Global Map">
          <div class="map-overlay"></div>
          <div class="scanner-line"></div>
          <div class="crosshair" style="top: 40%; left: 60%;"></div>
          <div class="crosshair" style="top: 70%; left: 30%; border-color: var(--alert-red);"></div>
        </div>
      </div>
    </aside>

    <!-- Center: Main Feed & Comms -->
    <main style="display: flex; flex-direction: column; gap: 24px;">
      <div class="glass-widget" style="flex: 2; display: flex; flex-direction: column; padding: 0; overflow: hidden;">
        <div class="module-header" style="padding: 20px 24px; border-bottom: 1px solid color-mix(in srgb, var(--surface-border) 50%, transparent); display: flex; justify-content: space-between; align-items: center; background: color-mix(in srgb, var(--surface-color) 40%, transparent);">
          <div class="widget-title" style="margin: 0; font-size: 14px;">Global Oversight (OCGF)</div>
          <span class="live-badge" style="background: color-mix(in srgb, var(--primary-color) 15%, transparent); color: var(--primary-color); border-color: color-mix(in srgb, var(--primary-color) 30%, transparent); margin-right: 0;">
            <div class="pulse-dot" style="background: var(--primary-color); box-shadow: 0 0 8px var(--primary-color);"></div>
            Monitoring Active
          </span>
        </div>
        <div style="flex: 1; position: relative;">
          <app-ocgf></app-ocgf>
        </div>
      </div>

      <div class="center-comms-grid">
        <div class="glass-widget" style="display: flex; flex-direction: column; padding: 0; overflow: hidden;">
          <div style="padding: 16px 20px; border-bottom: 1px solid color-mix(in srgb, var(--surface-border) 50%, transparent); background: color-mix(in srgb, var(--surface-color) 40%, transparent);">
            <div class="widget-title" style="margin: 0;">Whispernet Intercept</div>
          </div>
          <div style="flex: 1; position: relative;">
            <app-whispernet></app-whispernet>
          </div>
        </div>
        <div class="glass-widget" style="display: flex; flex-direction: column; padding: 0; overflow: hidden;">
          <div style="padding: 16px 20px; border-bottom: 1px solid color-mix(in srgb, var(--surface-border) 50%, transparent); background: color-mix(in srgb, var(--surface-color) 40%, transparent);">
            <div class="widget-title" style="margin: 0;">Frequenz X Intercept</div>
          </div>
          <div style="flex: 1; position: relative;">
            <app-frequenz-x></app-frequenz-x>
          </div>
        </div>
      </div>
    </main>

    <!-- Right Sidebar: Quick Actions & Logs -->
    <aside style="display: flex; flex-direction: column; gap: 24px;">
      <div class="glass-widget" style="flex: 1; display: flex; flex-direction: column; max-height: 800px; padding: 0;">
        <div style="padding: 24px 24px 16px; border-bottom: 1px solid color-mix(in srgb, var(--surface-border) 50%, transparent); background: color-mix(in srgb, var(--surface-color) 20%, transparent);">
          <div class="widget-title" style="margin: 0;">System Logs</div>
        </div>
        <div class="log-container" style="flex: 1; overflow-y: auto; padding: 16px 24px;">
          <div *ngIf="systemLogs.length === 0" class="log-entry" style="opacity: 0.5;">Awaiting data stream...</div>
          <div *ngFor="let log of systemLogs" class="log-entry" [class.urgent]="log.metadata === 'URGENT_KPI'">
            <strong style="color: var(--primary-color);">[{{ log.timestamp | date:'HH:mm:ss' }}] [{{ log.network | uppercase }}]</strong>
            <span style="display: block; margin-top: 4px;">{{ log.content }}</span>
          </div>
        </div>
      </div>
    </aside>
  </div>
</div>
  `
})
export class GmViewComponent implements OnInit {
  private feedService = inject(FeedService);
  public uiState = inject(UiStateService);
  private route = inject(ActivatedRoute);

  systemLogs: any[] = [];

  ngOnInit() {
    const sessionId = this.route.snapshot.paramMap.get('sessionId');
    if (sessionId) {
      this.feedService.connectToSession(sessionId);
    }
    
    this.feedService.streamMessages().subscribe(msg => {
      this.systemLogs.unshift(msg);
      if (this.systemLogs.length > 50) this.systemLogs.pop();
    });
  }

  broadcast() {
    this.feedService.injectMessage('ocgf', 'SYSTEM BROADCAST: Status update required from all agents.', 'URGENT_KPI');
  }
}
