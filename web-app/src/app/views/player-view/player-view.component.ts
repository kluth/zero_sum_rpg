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
  <div class="diegetic-os-shell">
    <header class="os-header">
      <div class="status-indicator warning">SYS.ON</div>
      <div class="time">{{ time$ | async | date:'HH:mm:ss' }}</div>
      <div class="connection glitch-text">UPLINK_SECURE</div>
    </header>

    <section class="cognitive-load-container">
      <div class="cognitive-label">
        <span>MENTAL BANDWIDTH</span>
        <span>{{ usedCapacity }} / 150 MB</span>
      </div>
      <div class="cognitive-bar">
        <div class="cognitive-fill" [style.width.%]="(usedCapacity / 150) * 100"
             [class.critical]="usedCapacity >= 140"></div>
      </div>
      <div class="stress-warning" *ngIf="usedCapacity >= 140">
        CRITICAL COGNITIVE LOAD DETECTED. ATROPHY IMMINENT.
      </div>
    </section>

    <main class="os-workspace">
      <article class="os-window">
        <div class="window-titlebar">WHISPERNET.exe</div>
        <div class="window-content"><app-whispernet></app-whispernet></div>
      </article>

      <article class="os-window">
        <div class="window-titlebar">FREQUENZ-X.sys</div>
        <div class="window-content"><app-frequenz-x></app-frequenz-x></div>
      </article>
      
      <article class="os-window">
        <div class="window-titlebar">NEON_LOTUS.bin</div>
        <div class="window-content"><app-neon-lotus></app-neon-lotus></div>
      </article>
    </main>

    <footer class="os-footer">
      <button class="os-button">REBOOT_CORE</button>
      <button class="os-button primary">AWAIT_ORDERS</button>
    </footer>
  </div>
  `
})
export class PlayerViewComponent implements OnInit {
  time$: Observable<Date> = new Observable();
  usedCapacity = 145; // Test data
  ngOnInit() {
    this.time$ = interval(1000).pipe(map(() => new Date()));
  }
}
