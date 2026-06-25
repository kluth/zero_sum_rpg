import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FeedService } from '../../services/feed.service';
import { OcgfComponent } from '../../ui/ocgf/ocgf.component';
import { WhispernetComponent } from '../../ui/whispernet/whispernet.component';
import { FrequenzXComponent } from '../../ui/frequenz-x/frequenz-x.component';

@Component({
  selector: 'app-gm-view',
  standalone: true,
  imports: [CommonModule, FormsModule, OcgfComponent, WhispernetComponent, FrequenzXComponent],
  template: `
  <div class="modern-dashboard">
    <header class="top-nav">
      <div class="branding">
        <img src="https://ui-avatars.com/api/?name=GM&background=ef4444&color=fff&rounded=true" alt="Logo" class="logo">
        <span class="brand-name">Zero-Sum Admin Panel</span>
      </div>
      <div class="user-profile">
        <span class="badge" style="background:#fef2f2; color:#991b1b; margin-right: 12px;">Session Live</span>
        <div class="user-info">
          <span class="user-name">Overseer</span>
          <span class="user-role">System Administrator</span>
        </div>
      </div>
    </header>

    <div class="dashboard-content" style="display: grid; grid-template-columns: 280px 1fr 350px; gap: 24px; padding: 24px; height: calc(100vh - 64px);">
      <!-- Left Sidebar: Controls & Vitals -->
      <aside style="display: flex; flex-direction: column; gap: 24px;">
        <div class="clean-panel widget">
          <h3 style="margin-bottom: 16px;">System Controls</h3>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <button class="zs-btn w-full" (click)="broadcast()">Global Broadcast</button>
            <button class="zs-btn w-full" style="background: var(--surface-border); color: var(--text-main);">Trigger Event</button>
            <button class="zs-btn w-full" style="background: var(--surface-border); color: var(--text-main);">Spawn NPC</button>
            <button class="zs-btn w-full" style="background: var(--alert-red); color: white;">Emergency Shutdown</button>
          </div>
        </div>
        
        <div class="clean-panel widget" style="flex: 1;">
          <h3 style="margin-bottom: 16px;">Agent Overview</h3>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px;">
                <strong>Agent 01 (A. Chen)</strong> <span class="text-alert">HR: 120</span>
              </div>
              <div style="height: 6px; background: var(--surface-border); border-radius: 3px; overflow: hidden;">
                <div style="width: 96%; background: var(--success-green); height: 100%;"></div>
              </div>
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px;">
                <strong>Agent 02 (J. Doe)</strong> <span class="text-muted">HR: 85</span>
              </div>
              <div style="height: 6px; background: var(--surface-border); border-radius: 3px; overflow: hidden;">
                <div style="width: 82%; background: var(--success-green); height: 100%;"></div>
              </div>
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px;">
                <strong>Agent 03 (M. Smith)</strong> <span class="text-alert">HR: 140!</span>
              </div>
              <div style="height: 6px; background: var(--surface-border); border-radius: 3px; overflow: hidden;">
                <div style="width: 45%; background: var(--alert-red); height: 100%;"></div>
              </div>
            </div>
          </div>
          
          <h3 style="margin-top: 24px; margin-bottom: 8px;">Global Map</h3>
          <img src="https://picsum.photos/300/400?grayscale&blur=1" alt="Global Map" style="border-radius:8px; width:100%; height: 150px; object-fit: cover;">
        </div>
      </aside>

      <!-- Center: Main Feed & Comms -->
      <main style="display: flex; flex-direction: column; gap: 24px; overflow: hidden;">
        <div class="clean-panel module" style="flex: 2; display: flex; flex-direction: column; overflow: hidden;">
          <div class="module-header" style="flex-shrink: 0; padding-bottom: 12px; border-bottom: 1px solid var(--surface-border); margin-bottom: 12px;">
            <h3 style="margin: 0;">Global Oversight (OCGF)</h3>
            <span class="badge">Monitoring Active</span>
          </div>
          <div style="flex: 1; overflow: hidden;">
            <app-ocgf></app-ocgf>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; flex: 1; overflow: hidden;">
          <div class="clean-panel module" style="display: flex; flex-direction: column; overflow: hidden;">
            <h3 style="flex-shrink: 0; margin-bottom: 12px; font-size: 14px; color: var(--text-muted); text-transform: uppercase;">Whispernet Intercept</h3>
            <div style="flex: 1; overflow: hidden;">
              <app-whispernet></app-whispernet>
            </div>
          </div>
          <div class="clean-panel module" style="display: flex; flex-direction: column; overflow: hidden;">
            <h3 style="flex-shrink: 0; margin-bottom: 12px; font-size: 14px; color: var(--text-muted); text-transform: uppercase;">Frequenz X Intercept</h3>
            <div style="flex: 1; overflow: hidden;">
              <app-frequenz-x></app-frequenz-x>
            </div>
          </div>
        </div>
      </main>

      <!-- Right Sidebar: Quick Actions & Logs -->
      <aside style="display: flex; flex-direction: column; gap: 24px;">
        <div class="clean-panel widget" style="flex: 1; overflow-y: auto;">
          <h3 style="margin-bottom: 16px;">System Logs</h3>
          <div style="display: flex; flex-direction: column; gap: 8px; font-family: monospace; font-size: 12px; color: var(--text-muted);">
            <div style="padding: 8px; background: #f9fafb; border-radius: 4px;">[12:00:01] System boot complete.</div>
            <div style="padding: 8px; background: #f9fafb; border-radius: 4px;">[12:00:05] Agent 01 authenticated.</div>
            <div style="padding: 8px; background: #fef2f2; color: #991b1b; border-radius: 4px;">[12:05:12] Agent 03 heart rate spiked.</div>
            <div style="padding: 8px; background: #f9fafb; border-radius: 4px;">[12:10:00] Location ping sent.</div>
            <div style="padding: 8px; background: #eff6ff; color: #1d4ed8; border-radius: 4px;">[12:15:30] Whispernet message intercepted.</div>
          </div>
        </div>
      </aside>
    </div>
  </div>
  `
})
export class GmViewComponent {
  private feedService = inject(FeedService);

  broadcast() {
    this.feedService.injectMessage('ocgf', 'SYSTEM BROADCAST: Status update required from all agents.', 'URGENT_KPI');
  }
}
