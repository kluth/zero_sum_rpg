import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FeedService, FeedMessage } from '../../services/feed.service';
import { OcgfComponent } from '../../ui/ocgf/ocgf.component';

@Component({
  selector: 'app-gm-view',
  standalone: true,
  imports: [CommonModule, FormsModule, OcgfComponent],
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

    <div class="dashboard-content">
      <aside class="sidebar">
        <div class="clean-panel widget">
          <h3>System Controls</h3>
          <div class="flex-container" style="flex-direction: column; gap: 8px; margin-top: 16px;">
            <button class="zs-btn w-full" (click)="broadcast()">Broadcast Global Msg</button>
            <button class="zs-btn w-full" style="background: var(--surface-border); color: var(--text-main);">Trigger Event</button>
            <button class="zs-btn w-full" style="background: var(--alert-red); color: white;">Emergency Shutdown</button>
          </div>
        </div>
        <div class="clean-panel widget" style="flex: 1;">
          <h3>Agent Locations</h3>
          <img src="https://picsum.photos/300/400?grayscale&blur=1" alt="Global Map" class="widget-img" style="border-radius:8px; margin-top: 10px; width:100%; height: 100%; object-fit: cover;">
        </div>
      </aside>

      <main class="main-area">
        <div class="clean-panel module" style="flex: 1;">
          <div class="module-header">
            <h3>Global Feed Oversight</h3>
            <span class="badge">Monitoring Active</span>
          </div>
          <app-ocgf></app-ocgf>
        </div>
      </main>
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
