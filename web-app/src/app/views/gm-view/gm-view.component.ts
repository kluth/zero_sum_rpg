import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OcgfComponent } from '../../ui/ocgf/ocgf.component';
import { FormsModule } from '@angular/forms';
import { FeedService } from '../../services/feed.service';

@Component({
  selector: 'app-gm-view',
  standalone: true,
  imports: [CommonModule, OcgfComponent, FormsModule],
  template: `
  <div style="display: flex; height: 100vh;">
    <div style="flex: 1; padding: 30px; border-right: 1px solid var(--surface-border); display: flex; flex-direction: column;">
      <h2 style="margin-bottom: 10px;">[GM OVERSEER TERMINAL]</h2>
      <p class="text-muted" style="color: var(--text-muted); margin-bottom: 30px;">Inject commands directly into the players' WhisperNet Feed.</p>
      
      <div class="glass-panel" style="flex: 1; display: flex; flex-direction: column;">
        <div class="mb-4">
          <label class="zs-label">TARGET NETWORK</label>
          <select class="zs-select" [(ngModel)]="network">
            <option value="whispernet">WhisperNet</option>
            <option value="frequenz-x">Frequenz-X</option>
          </select>
        </div>
        
        <div class="mb-4">
          <label class="zs-label">PRIORITY LEVEL</label>
          <select class="zs-select" [(ngModel)]="priority">
            <option value="NORMAL">NORMAL</option>
            <option value="URGENT_KPI">URGENT_KPI</option>
          </select>
        </div>

        <div class="mb-4" style="flex: 1; display: flex; flex-direction: column;">
          <label class="zs-label">MESSAGE PAYLOAD</label>
          <textarea class="zs-textarea" [(ngModel)]="content" style="flex: 1; resize: none;" placeholder="Enter directive here..."></textarea>
        </div>

        <button class="zs-btn w-full mt-4" (click)="sendMessage()">
          TRANSMIT DIRECTIVE
        </button>

        <div *ngIf="status" class="mt-4" [ngClass]="{'text-alert': status.includes('failed'), 'text-cyan': !status.includes('failed')}">
          > {{ status }}
        </div>
      </div>
    </div>
    
    <div style="flex: 2; position: relative;">
      <app-ocgf></app-ocgf>
    </div>
  </div>
  `
})
export class GmViewComponent {
  network = 'whispernet';
  priority = 'URGENT_KPI';
  content = '';
  status = '';
  private feedService = inject(FeedService);

  sendMessage() {
    this.status = 'Injecting...';
    
    this.feedService.injectMessage(this.network, this.content, this.priority)
      .then(() => {
        this.content = '';
        this.status = 'Injecting... DONE';
        setTimeout(() => this.status = '', 2000);
      })
      .catch(err => {
        this.status = 'Injection failed: ' + err.message;
      });
  }
}
