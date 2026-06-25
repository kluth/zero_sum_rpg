import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OcgfComponent } from '../../ui/ocgf/ocgf.component';
import { WhispernetComponent } from '../../ui/whispernet/whispernet.component';
import { FrequenzXComponent } from '../../ui/frequenz-x/frequenz-x.component';

@Component({
  selector: 'app-spectator-view',
  standalone: true,
  imports: [CommonModule, OcgfComponent, WhispernetComponent, FrequenzXComponent],
  template: `
    <div class="spectator-layout">
      <!-- Left Column: Map & Vitals -->
      <div class="spec-col">
        <div class="clean-panel spec-panel" style="flex: 2;">
          <div class="panel-header">Global Positioning</div>
          <div class="panel-body">
            <img src="https://picsum.photos/400/400?blur=1" alt="World Map" class="w-full h-full object-cover rounded">
          </div>
        </div>
        <div class="clean-panel spec-panel" style="flex: 1;">
          <div class="panel-header">Agent Vitals</div>
          <div class="panel-body flex-col gap-2">
            <div class="vital-row">
              <span>Agent 01 (A. Chen)</span>
              <div class="vital-bar"><div class="vital-fill" style="width: 96%; background: var(--success-green)"></div></div>
            </div>
            <div class="vital-row">
              <span>Agent 02 (J. Doe)</span>
              <div class="vital-bar"><div class="vital-fill" style="width: 82%; background: var(--success-green)"></div></div>
            </div>
            <div class="vital-row">
              <span>Agent 03 (M. Smith)</span>
              <div class="vital-bar"><div class="vital-fill" style="width: 45%; background: var(--alert-red)"></div></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Center Column: Global Feed -->
      <div class="spec-col">
        <div class="clean-panel spec-panel" style="flex: 1;">
          <div class="panel-header">Global Feed (OCGF)</div>
          <div class="panel-body no-scroll-feed">
            <app-ocgf></app-ocgf>
          </div>
        </div>
      </div>

      <!-- Right Column: Whispernet & Frequenz X -->
      <div class="spec-col">
        <div class="clean-panel spec-panel" style="flex: 1;">
          <div class="panel-header">Secure Comms (Whispernet)</div>
          <div class="panel-body no-scroll-feed">
            <app-whispernet></app-whispernet>
          </div>
        </div>
        <div class="clean-panel spec-panel" style="flex: 1;">
          <div class="panel-header">Public Comms (Frequenz X)</div>
          <div class="panel-body no-scroll-feed">
            <app-frequenz-x></app-frequenz-x>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .spectator-layout {
      display: grid;
      grid-template-columns: 1fr 1.5fr 1fr;
      gap: 16px;
      width: 100vw;
      height: 100vh;
      padding: 16px;
      background: var(--bg-color);
      overflow: hidden; /* NO SCROLLBARS */
    }
    
    .spec-col {
      display: flex;
      flex-direction: column;
      gap: 16px;
      height: calc(100vh - 32px);
      overflow: hidden;
    }

    .spec-panel {
      display: flex;
      flex-direction: column;
      padding: 16px;
      overflow: hidden;
    }

    .panel-header {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 12px;
      flex-shrink: 0;
    }

    .panel-body {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .object-cover { object-fit: cover; }
    .rounded { border-radius: 8px; }
    .h-full { height: 100%; }
    .flex-col { display: flex; flex-direction: column; }
    .gap-2 { gap: 12px; }

    .vital-row {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 13px;
      font-weight: 500;
    }

    .vital-bar {
      height: 6px;
      background: var(--surface-border);
      border-radius: 3px;
      overflow: hidden;
    }

    .vital-fill {
      height: 100%;
      border-radius: 3px;
    }

    /* Force hide scrollbars in child components for spectator view */
    :host ::ng-deep ::-webkit-scrollbar {
      display: none !important;
    }
    :host ::ng-deep * {
      -ms-overflow-style: none !important;
      scrollbar-width: none !important;
    }

    /* Prevent inputs/controls from showing in spectator view components if possible, or we just rely on the fact that spectator won't use them */
    :host ::ng-deep .ocgf-input-area,
    :host ::ng-deep .input-area {
      display: none !important; /* Hide input areas in feeds for spectator */
    }
    
    :host ::ng-deep .feed-list,
    :host ::ng-deep .message-list {
      height: 100% !important;
      max-height: 100% !important;
      padding-bottom: 0 !important;
    }
  `]
})
export class SpectatorViewComponent {}
