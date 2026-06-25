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
  styleUrls: ['./spectator-view.component.scss']
})
export class SpectatorViewComponent {}
