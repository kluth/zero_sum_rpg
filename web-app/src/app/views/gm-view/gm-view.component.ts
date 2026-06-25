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
  <div style="display: flex; height: 100vh; background: #050505; color: #00ff00; font-family: monospace;">
    <div style="flex: 1; padding: 20px; border-right: 1px solid #333;">
      <h2>[GM OVERSEER TERMINAL]</h2>
      <p>Inject commands directly into the players' WhisperNet Feed.</p>
      
      <div style="margin-top: 20px;">
        <label>Network:</label><br>
        <select [(ngModel)]="network" style="background: black; color: #00ff00; border: 1px solid #00ff00; padding: 5px; width: 100%; margin-bottom: 10px;">
          <option value="whispernet">WhisperNet</option>
          <option value="frequenz-x">Frequenz-X</option>
        </select>
        
        <label>Priority:</label><br>
        <select [(ngModel)]="priority" style="background: black; color: #00ff00; border: 1px solid #00ff00; padding: 5px; width: 100%; margin-bottom: 10px;">
          <option value="NORMAL">NORMAL</option>
          <option value="URGENT_KPI">URGENT_KPI</option>
        </select>

        <label>Message Payload:</label><br>
        <textarea [(ngModel)]="content" rows="4" style="background: black; color: #00ff00; border: 1px solid #00ff00; padding: 5px; width: 100%; margin-bottom: 10px;"></textarea>

        <button (click)="sendMessage()" style="background: #00ff00; color: black; border: none; padding: 10px 20px; cursor: pointer; font-weight: bold; width: 100%;">
          INJECT PAYLOAD
        </button>
      </div>
      
      <div *ngIf="status" style="margin-top: 20px; color: yellow;">
        {{ status }}
      </div>
    </div>
    
    <div style="flex: 2; padding: 20px;">
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
