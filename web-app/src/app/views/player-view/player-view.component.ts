import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WhispernetComponent } from '../../ui/whispernet/whispernet.component';
import { FrequenzXComponent } from '../../ui/frequenz-x/frequenz-x.component';
import { Observable, interval } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-player-view',
  standalone: true,
  imports: [CommonModule, WhispernetComponent, FrequenzXComponent],
  template: `
  <div class="os-desktop">
    <!-- Desktop Icons / Area -->
    <div class="desktop-area">
      <!-- Browser Window (Social Network) -->
      <div class="os-window" *ngIf="showBrowser" [style.zIndex]="activeWindow === 'browser' ? 10 : 1" (mousedown)="focusWindow('browser')" style="top: 10%; left: 10%; width: 60%; height: 70%;">
        <div class="window-titlebar">
          <div class="window-controls">
            <div class="win-btn close" (click)="showBrowser = false"></div>
            <div class="win-btn minimize" (click)="showBrowser = false"></div>
            <div class="win-btn maximize"></div>
          </div>
          <span class="window-title">Z-Browser - Frequenz X</span>
        </div>
        <div class="window-content" style="background: white;">
          <app-frequenz-x></app-frequenz-x>
        </div>
      </div>

      <!-- Messenger Window -->
      <div class="os-window" *ngIf="showMessenger" [style.zIndex]="activeWindow === 'messenger' ? 10 : 1" (mousedown)="focusWindow('messenger')" style="top: 15%; left: 55%; width: 400px; height: 600px;">
        <div class="window-titlebar">
          <div class="window-controls">
            <div class="win-btn close" (click)="showMessenger = false"></div>
            <div class="win-btn minimize" (click)="showMessenger = false"></div>
            <div class="win-btn maximize"></div>
          </div>
          <span class="window-title">Whispernet Secure Messenger</span>
        </div>
        <div class="window-content" style="background: #f9fafb;">
          <app-whispernet></app-whispernet>
        </div>
      </div>

      <!-- Maps Window -->
      <div class="os-window" *ngIf="showMaps" [style.zIndex]="activeWindow === 'maps' ? 10 : 1" (mousedown)="focusWindow('maps')" style="top: 20%; left: 20%; width: 50%; height: 60%;">
        <div class="window-titlebar">
          <div class="window-controls">
            <div class="win-btn close" (click)="showMaps = false"></div>
            <div class="win-btn minimize" (click)="showMaps = false"></div>
            <div class="win-btn maximize"></div>
          </div>
          <span class="window-title">Global Nav</span>
        </div>
        <div class="window-content" style="padding: 0; overflow: hidden;">
          <img src="https://picsum.photos/800/600?blur=1" alt="Map" style="width: 100%; height: 100%; object-fit: cover;">
          <div style="position: absolute; top: 20px; left: 20px; background: white; padding: 12px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <strong>Current Location:</strong> Sector 4G
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Taskbar -->
    <div class="os-taskbar">
      <div class="taskbar-start">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
      </div>
      
      <div class="taskbar-apps">
        <div class="taskbar-icon" [class.active]="showBrowser" (click)="toggleWindow('browser')">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
        </div>
        <div class="taskbar-icon" [class.active]="showMessenger" (click)="toggleWindow('messenger')">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
        </div>
        <div class="taskbar-icon" [class.active]="showMaps" (click)="toggleWindow('maps')">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon><line x1="9" y1="3" x2="9" y2="18"></line><line x1="15" y1="6" x2="15" y2="21"></line></svg>
        </div>
      </div>

      <div class="taskbar-tray">
        <span>Vitals: 96%</span>
        <span>{{ time$ | async | date:'HH:mm' }}</span>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .os-desktop {
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      background: url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop') no-repeat center center;
      background-size: cover;
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .desktop-area {
      flex: 1;
      position: relative;
    }

    .os-window {
      position: absolute;
      background: var(--surface-color);
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
    }

    .window-titlebar {
      height: 40px;
      background: rgba(243, 244, 246, 0.9);
      display: flex;
      align-items: center;
      padding: 0 16px;
      border-bottom: 1px solid var(--surface-border);
      cursor: default; /* In a real app, this would be draggable */
    }

    .window-controls {
      display: flex;
      gap: 8px;
      margin-right: 16px;
    }

    .win-btn {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      cursor: pointer;
    }

    .close { background: #ff5f56; }
    .minimize { background: #ffbd2e; }
    .maximize { background: #27c93f; }

    .window-title {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-muted);
    }

    .window-content {
      flex: 1;
      overflow-y: auto;
      position: relative;
    }

    .os-taskbar {
      height: 48px;
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(20px);
      border-top: 1px solid rgba(255,255,255,0.3);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      z-index: 100;
    }

    .taskbar-start {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary-color);
      cursor: pointer;
      transition: background 0.2s;
    }

    .taskbar-start:hover {
      background: rgba(0,0,0,0.05);
    }

    .taskbar-apps {
      display: flex;
      gap: 8px;
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
    }

    .taskbar-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.2s;
      position: relative;
    }

    .taskbar-icon:hover {
      background: rgba(0,0,0,0.05);
      color: var(--text-main);
    }

    .taskbar-icon.active {
      color: var(--primary-color);
    }

    .taskbar-icon.active::after {
      content: '';
      position: absolute;
      bottom: 2px;
      width: 4px;
      height: 4px;
      border-radius: 2px;
      background: var(--primary-color);
    }

    .taskbar-tray {
      display: flex;
      align-items: center;
      gap: 16px;
      font-size: 13px;
      font-weight: 500;
      color: var(--text-main);
    }
  `]
})
export class PlayerViewComponent implements OnInit {
  time$: Observable<Date> = new Observable();
  
  showBrowser = true;
  showMessenger = true;
  showMaps = false;

  activeWindow = 'browser';

  ngOnInit() {
    this.time$ = interval(1000).pipe(map(() => new Date()));
  }

  toggleWindow(win: string) {
    if (win === 'browser') {
      this.showBrowser = !this.showBrowser;
      if (this.showBrowser) this.activeWindow = 'browser';
    }
    if (win === 'messenger') {
      this.showMessenger = !this.showMessenger;
      if (this.showMessenger) this.activeWindow = 'messenger';
    }
    if (win === 'maps') {
      this.showMaps = !this.showMaps;
      if (this.showMaps) this.activeWindow = 'maps';
    }
  }

  focusWindow(win: string) {
    this.activeWindow = win;
  }
}
