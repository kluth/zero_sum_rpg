import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WhispernetComponent } from '../../ui/whispernet/whispernet.component';
import { FrequenzXComponent } from '../../ui/frequenz-x/frequenz-x.component';
import { UiStateService } from '../../services/ui-state.service';
import { Observable, interval } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-player-view',
  standalone: true,
  imports: [CommonModule, WhispernetComponent, FrequenzXComponent],
  template: `
  <div class="os-desktop" [class.stabilized]="uiState.isStabilized()">
    <!-- Swipe Area wraps the desktop-area -->
    <div data-test-id="swipe-area" class="desktop-area"
         (mousedown)="onSwipeStart($event)" (mouseup)="onSwipeEnd($event)"
         (touchstart)="onSwipeStart($event)" (touchend)="onSwipeEnd($event)"
         (touchmove)="onTouchMove($event)">
         
      <!-- Browser Window (Social Network) -->
      <div class="os-window" #browserWin *ngIf="showBrowser" 
           [style.zIndex]="activeWindow === 'browser' ? 10 : 1" 
           [style.left]="windowPositions['browser'] ? windowPositions['browser'].x + 'px' : '5%'"
           [style.top]="windowPositions['browser'] ? windowPositions['browser'].y + 'px' : '5%'"
           (mousedown)="focusWindow('browser'); $event.stopPropagation()"
           (touchstart)="focusWindow('browser'); $event.stopPropagation()"
           style="width: 50%; height: 50%;">
        <div class="window-titlebar"
             (mousedown)="onWindowDragStart($event, 'browser', browserWin)"
             (touchstart)="onWindowDragStart($event, 'browser', browserWin)"
             style="cursor: move;">
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
      <div class="os-window" #messengerWin *ngIf="showMessenger" 
           [style.zIndex]="activeWindow === 'messenger' ? 10 : 1" 
           [style.left]="windowPositions['messenger'] ? windowPositions['messenger'].x + 'px' : '15%'"
           [style.top]="windowPositions['messenger'] ? windowPositions['messenger'].y + 'px' : '10%'"
           (mousedown)="focusWindow('messenger'); $event.stopPropagation()"
           (touchstart)="focusWindow('messenger'); $event.stopPropagation()"
           style="width: 400px; height: 500px;">
        <div class="window-titlebar"
             (mousedown)="onWindowDragStart($event, 'messenger', messengerWin)"
             (touchstart)="onWindowDragStart($event, 'messenger', messengerWin)"
             style="cursor: move;">
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
      <div class="os-window" #mapsWin *ngIf="showMaps" 
           [style.zIndex]="activeWindow === 'maps' ? 10 : 1" 
           [style.left]="windowPositions['maps'] ? windowPositions['maps'].x + 'px' : '10%'"
           [style.top]="windowPositions['maps'] ? windowPositions['maps'].y + 'px' : '15%'"
           (mousedown)="focusWindow('maps'); $event.stopPropagation()"
           (touchstart)="focusWindow('maps'); $event.stopPropagation()"
           style="width: 45%; height: 45%;">
        <div class="window-titlebar"
             (mousedown)="onWindowDragStart($event, 'maps', mapsWin)"
             (touchstart)="onWindowDragStart($event, 'maps', mapsWin)"
             style="cursor: move;">
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

      <!-- ALWAYS OPEN CONTROL PANEL WINDOW FOR DIEGETIC CONTROLS & NETRUNNER CONSOLE -->
      <div class="os-window control-panel-window" #controlPanelWin 
           [style.left]="windowPositions['controlPanel'] ? windowPositions['controlPanel'].x + 'px' : null"
           [style.top]="windowPositions['controlPanel'] ? windowPositions['controlPanel'].y + 'px' : '5%'"
           [style.right]="windowPositions['controlPanel'] ? null : '2%'"
           (mousedown)="$event.stopPropagation()"
           (touchstart)="$event.stopPropagation()"
           style="width: 380px; height: 85%; z-index: 20; display: flex; flex-direction: column;">
        <div class="window-titlebar"
             (mousedown)="onWindowDragStart($event, 'controlPanel', controlPanelWin)"
             (touchstart)="onWindowDragStart($event, 'controlPanel', controlPanelWin)"
             style="cursor: move;">
          <span class="window-title">SYSTEM CONTROL PANEL</span>
        </div>
        <div class="window-content" style="padding: 12px; display: flex; flex-direction: column; gap: 12px; background: #0c0f12; color: #33ff33; font-family: monospace; overflow-y: auto;">
          
          <!-- Theme & Stabilizer -->
          <div class="control-section">
            <span style="font-weight: bold; color: #00ffcc;">SYSTEM SETTINGS</span>
            <div style="display: flex; gap: 8px; margin-top: 4px;">
              <button data-test-id="theme-toggle" (click)="uiState.toggleTheme()" class="zs-btn" style="flex: 1; padding: 6px 12px; font-size: 11px;">Theme Shift</button>
              <button data-test-id="stabilizer-toggle" (click)="uiState.toggleStabilizer()" class="zs-btn" style="flex: 1; padding: 6px 12px; font-size: 11px;">Stabilizer</button>
            </div>
          </div>

          <!-- Biometric Scanner -->
          <div class="control-section">
            <span style="font-weight: bold; color: #00ffcc;">BIOMETRIC AUTHENTICATION</span>
            <div data-test-id="biometric-scanner"
                 [class.scan-success]="scanSuccess"
                 [class.scanning]="isScanning"
                 (mousedown)="onScanStart($event)"
                 (mouseup)="onScanEnd($event)"
                 (mouseleave)="onScanEnd($event)"
                 (touchstart)="onScanStart($event)"
                 (touchend)="onScanEnd($event)"
                 style="width: 100%; height: 50px; display: flex; align-items: center; justify-content: center; border: 2px dashed #33ff33; cursor: pointer; border-radius: 4px; user-select: none; transition: background 0.3s; position: relative; margin-top: 4px; min-width: 44px; min-height: 44px;">
              <span style="font-size: 12px;">{{ scannerText }}</span>
              <div class="scan-pulse" *ngIf="isScanning"></div>
            </div>
          </div>

          <!-- NDA Signature -->
          <div class="control-section" style="display: flex; flex-direction: column; gap: 4px;">
            <span style="font-weight: bold; color: #00ffcc;">NDA AUTHORIZATION</span>
            <div style="position: relative;">
              <canvas #ndaCanvas
                      data-test-id="nda-canvas"
                      [attr.data-stabilized]="uiState.isStabilized() ? 'true' : null"
                      [class.stabilized-draw]="uiState.isStabilized()"
                      (mousedown)="onDrawStart($event)"
                      (mousemove)="onDrawMove($event)"
                      (mouseup)="onDrawEnd($event)"
                      (mouseleave)="onDrawEnd($event)"
                      (touchstart)="onDrawStart($event)"
                      (touchmove)="onDrawMove($event)"
                      (touchend)="onDrawEnd($event)"
                      style="border: 1px solid #33ff33; background: #05070a; width: 100%; height: 90px; display: block;"></canvas>
              <button (click)="clearCanvas()" class="zs-btn" style="position: absolute; right: 4px; top: 4px; font-size: 9px; padding: 2px 4px;">Clear</button>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <button data-test-id="nda-approve-btn" [disabled]="strokes.length === 0" (click)="approveNDA()" class="zs-btn" style="padding: 6px 12px; font-size: 11px;">Approve NDA</button>
              <span *ngIf="ndaApproved" data-test-id="nda-approved-label" style="color: #00ff00; font-size: 11px; font-weight: bold;">[NDA Approved]</span>
            </div>
          </div>

          <!-- Emergency Heal -->
          <div class="control-section">
            <span style="font-weight: bold; color: #00ffcc;">NANITE INJECTOR</span>
            <button data-test-id="emergency-heal-btn" (click)="onEmergencyHeal()" class="zs-btn" style="width: 100%; background: #990000; border: 1px solid #ff3333; color: white; padding: 8px 12px; font-size: 12px; margin-top: 4px; font-weight: bold; letter-spacing: 1px;">
              EMERGENCY HEAL
            </button>
          </div>

          <!-- Netrunner Terminal -->
          <div class="control-section" style="flex: 1; display: flex; flex-direction: column; min-height: 140px;">
            <span style="font-weight: bold; color: #00ffcc;">NETRUNNER TERMINAL</span>
            <div data-test-id="terminal-logs" style="flex: 1; border: 1px solid #33ff33; background: #05070a; padding: 6px; font-size: 10px; overflow-y: auto; display: flex; flex-direction: column; gap: 2px; margin-top: 4px; min-height: 80px;">
              <div *ngFor="let log of terminalLogs">
                {{ log }}
              </div>
            </div>
            <input data-test-id="terminal-input"
                   #termInput
                   (keydown.enter)="handleTerminalCommand(termInput.value); termInput.value = ''"
                   placeholder="type status/help/clear..."
                   style="width: 100%; border: 1px solid #33ff33; background: #000; color: #33ff33; padding: 4px 8px; font-family: monospace; outline: none; margin-top: 4px; font-size: 11px;" />
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
  styleUrls: ['./player-view.component.scss']
})
export class PlayerViewComponent implements OnInit, AfterViewInit {
  @ViewChild('ndaCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  public uiState = inject(UiStateService);

  time$: Observable<Date> = new Observable();

  // Draggable Window State
  windowPositions: { [key: string]: { x: number, y: number } } = {};
  private draggingWindow: string | null = null;
  private dragStartX = 0;
  private dragStartY = 0;
  private dragStartWindowX = 0;
  private dragStartWindowY = 0;

  onWindowDragStart(event: MouseEvent | TouchEvent, winId: string, windowEl: HTMLElement) {
    if (event instanceof MouseEvent && event.button !== 0) return;
    if (window.innerWidth <= 768) return; // Disable dragging on mobile stacked layout

    this.focusWindow(winId);

    const desktopEl = windowEl.closest('.desktop-area');
    const desktopRect = desktopEl ? desktopEl.getBoundingClientRect() : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
    const winRect = windowEl.getBoundingClientRect();

    this.dragStartWindowX = winRect.left - desktopRect.left;
    this.dragStartWindowY = winRect.top - desktopRect.top;

    this.dragStartX = ('touches' in event && event.touches.length > 0)
      ? event.touches[0].clientX
      : (event as MouseEvent).clientX;
    this.dragStartY = ('touches' in event && event.touches.length > 0)
      ? event.touches[0].clientY
      : (event as MouseEvent).clientY;

    if (!this.windowPositions[winId]) {
      this.windowPositions[winId] = { x: this.dragStartWindowX, y: this.dragStartWindowY };
    }

    this.draggingWindow = winId;

    if (event.cancelable) {
      event.preventDefault();
    }
    event.stopPropagation();
  }

  @HostListener('window:mousemove', ['$event'])
  @HostListener('window:touchmove', ['$event'])
  onWindowDragMove(event: MouseEvent | TouchEvent) {
    if (!this.draggingWindow) return;

    const clientX = ('touches' in event && event.touches.length > 0)
      ? event.touches[0].clientX
      : (event as MouseEvent).clientX;
    const clientY = ('touches' in event && event.touches.length > 0)
      ? event.touches[0].clientY
      : (event as MouseEvent).clientY;

    const deltaX = clientX - this.dragStartX;
    const deltaY = clientY - this.dragStartY;

    let newX = this.dragStartWindowX + deltaX;
    let newY = this.dragStartWindowY + deltaY;

    // Boundary snapping: clamp coordinates (X >= 0, Y >= 0)
    newX = Math.max(0, newX);
    newY = Math.max(0, newY);

    this.windowPositions[this.draggingWindow] = { x: newX, y: newY };
  }

  @HostListener('window:mouseup')
  @HostListener('window:touchend')
  onWindowDragEnd() {
    this.draggingWindow = null;
  }
  
  showBrowser = true;
  showMessenger = true;
  showMaps = false;

  activeWindow = 'browser';

  // Biometric Scanner State
  scanSuccess = false;
  isScanning = false;
  scannerText = 'Hold to Authenticate Biometrics';
  private scanTimer: any = null;

  // NDA Canvas Drawing State
  isDrawing = false;
  currentStroke: Array<{ x: number, y: number }> = [];
  strokes: Array<Array<{ x: number, y: number }>> = [];
  ndaApproved = false;

  // Emergency Heal State
  healCount = 0;

  // Terminal Console State
  terminalLogs: string[] = ['System Ready. Awaiting commands...'];

  private swipeStartX = 0;

  ngOnInit() {
    this.time$ = interval(1000).pipe(map(() => new Date()));
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initCanvasSize();
      this.redrawCanvas();
    }, 100);
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.initCanvasSize();
    this.redrawCanvas();
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

  // --- Biometric Scanner ---
  onScanStart(event: MouseEvent | TouchEvent) {
    if (this.scanSuccess) return;
    this.isScanning = true;
    this.scannerText = 'Scanning Biometrics...';
    
    if (this.scanTimer) clearTimeout(this.scanTimer);
    this.scanTimer = setTimeout(() => {
      this.scanSuccess = true;
      this.isScanning = false;
      this.scannerText = 'Authorized: Success';
    }, 1100);
  }

  onScanEnd(event: MouseEvent | TouchEvent) {
    this.cancelScan();
  }

  cancelScan() {
    if (this.scanSuccess) return;
    this.isScanning = false;
    this.scannerText = 'Hold to Authenticate Biometrics';
    if (this.scanTimer) {
      clearTimeout(this.scanTimer);
      this.scanTimer = null;
    }
  }

  // --- NDA Canvas ---
  getCanvas(): HTMLCanvasElement | null {
    if (this.canvasRef && this.canvasRef.nativeElement) {
      return this.canvasRef.nativeElement;
    }
    return document.querySelector('canvas[data-test-id="nda-canvas"]') as HTMLCanvasElement;
  }

  initCanvasSize() {
    const canvas = this.getCanvas();
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    }
  }

  private getEventCoords(event: MouseEvent | TouchEvent): { x: number, y: number } | null {
    const canvas = this.getCanvas();
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if (window.TouchEvent && event instanceof TouchEvent) {
      if (event.touches.length === 0) return null;
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else if (event instanceof MouseEvent) {
      clientX = event.clientX;
      clientY = event.clientY;
    } else {
      const anyEv: any = event;
      if (anyEv.touches && anyEv.touches.length > 0) {
        clientX = anyEv.touches[0].clientX;
        clientY = anyEv.touches[0].clientY;
      } else {
        clientX = anyEv.clientX;
        clientY = anyEv.clientY;
      }
    }

    return {
      x: (clientX - rect.left) / rect.width,
      y: (clientY - rect.top) / rect.height
    };
  }

  onDrawStart(event: MouseEvent | TouchEvent) {
    if (event.cancelable) {
      event.preventDefault();
    }
    this.isDrawing = true;
    const coords = this.getEventCoords(event);
    if (coords) {
      this.currentStroke = [coords];
      this.strokes = [...this.strokes, this.currentStroke];
      this.redrawCanvas();
    }
  }

  onDrawMove(event: MouseEvent | TouchEvent) {
    if (!this.isDrawing) return;
    if (event.cancelable) {
      event.preventDefault();
    }
    const coords = this.getEventCoords(event);
    if (coords) {
      if (this.uiState.isStabilized() && this.currentStroke.length > 0) {
        const last = this.currentStroke[this.currentStroke.length - 1];
        const dx = coords.x - last.x;
        const dy = coords.y - last.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 0.02) {
          return;
        }
      }
      this.currentStroke.push(coords);
      this.redrawCanvas();
    }
  }

  onDrawEnd(event: MouseEvent | TouchEvent) {
    if (this.isDrawing) {
      this.isDrawing = false;
      this.currentStroke = [];
      this.redrawCanvas();
    }
  }

  clearCanvas() {
    this.strokes = [];
    this.ndaApproved = false;
    this.redrawCanvas();
  }

  approveNDA() {
    if (this.strokes.length > 0) {
      this.ndaApproved = true;
    }
  }

  redrawCanvas() {
    const canvas = this.getCanvas();
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#33ff33';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (const stroke of this.strokes) {
      if (stroke.length === 0) continue;
      ctx.beginPath();
      const p0 = stroke[0];
      ctx.moveTo(p0.x * canvas.width, p0.y * canvas.height);
      for (let i = 1; i < stroke.length; i++) {
        const p = stroke[i];
        ctx.lineTo(p.x * canvas.width, p.y * canvas.height);
      }
      ctx.stroke();
    }
  }

  // --- Emergency Heal ---
  onEmergencyHeal() {
    this.healCount++;
    console.log(`Emergency heal clicked. Count: ${this.healCount}`);
  }

  // --- Netrunner Terminal ---
  handleTerminalCommand(cmd: string) {
    const trimmed = cmd.trim().toLowerCase();
    if (!trimmed) return;

    this.terminalLogs.push(`> ${cmd}`);

    if (trimmed === 'status') {
      this.terminalLogs.push('System: ONLINE');
      this.terminalLogs.push('Theme: ' + this.uiState.currentTheme());
      this.terminalLogs.push('Stabilizer: ' + (this.uiState.isStabilized() ? 'ACTIVE' : 'INACTIVE'));
    } else if (trimmed === 'help') {
      this.terminalLogs.push('Available commands: status, help, clear, heal');
    } else if (trimmed === 'clear') {
      this.terminalLogs = [];
    } else if (trimmed === 'heal') {
      this.terminalLogs.push('Executing emergency healing...');
      this.onEmergencyHeal();
    } else {
      this.terminalLogs.push(`Unknown command: ${cmd}`);
    }
  }

  // --- Swipe Navigation & Gesture Touch Handling ---
  onSwipeStart(event: MouseEvent | TouchEvent) {
    if (window.TouchEvent && event instanceof TouchEvent) {
      this.swipeStartX = event.touches[0].clientX;
    } else if (event instanceof MouseEvent) {
      this.swipeStartX = event.clientX;
    } else {
      const anyEv: any = event;
      this.swipeStartX = anyEv.touches ? anyEv.touches[0].clientX : anyEv.clientX;
    }
  }

  onSwipeEnd(event: MouseEvent | TouchEvent) {
    let endX = 0;
    if (window.TouchEvent && event instanceof TouchEvent) {
      if (event.changedTouches.length > 0) {
        endX = event.changedTouches[0].clientX;
      }
    } else if (event instanceof MouseEvent) {
      endX = event.clientX;
    } else {
      const anyEv: any = event;
      endX = anyEv.changedTouches ? anyEv.changedTouches[0].clientX : anyEv.clientX;
    }

    const deltaX = endX - this.swipeStartX;
    if (Math.abs(deltaX) > 50) {
      this.cycleWindows(deltaX);
    }
  }

  cycleWindows(deltaX: number) {
    const windows = ['browser', 'messenger', 'maps'];
    let idx = windows.indexOf(this.activeWindow);
    if (deltaX > 0) {
      idx = (idx + 1) % windows.length;
    } else {
      idx = (idx - 1 + windows.length) % windows.length;
    }
    this.activeWindow = windows[idx];
    if (this.activeWindow === 'browser') this.showBrowser = true;
    if (this.activeWindow === 'messenger') this.showMessenger = true;
    if (this.activeWindow === 'maps') this.showMaps = true;
  }

  onTouchMove(event: TouchEvent) {
    // 1. Biometric scanner drag-out logic
    if (this.isScanning) {
      const touch = event.touches[0];
      const scannerEl = document.querySelector('[data-test-id="biometric-scanner"]');
      if (scannerEl) {
        const rect = scannerEl.getBoundingClientRect();
        if (
          touch.clientX < rect.left ||
          touch.clientX > rect.right ||
          touch.clientY < rect.top ||
          touch.clientY > rect.bottom
        ) {
          this.cancelScan();
        }
      }
    }
  }
}
