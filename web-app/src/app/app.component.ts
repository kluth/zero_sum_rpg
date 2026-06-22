import { Component, OnInit, signal, computed, effect, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, connectDatabaseEmulator, push } from 'firebase/database';

const firebaseConfig = {
  projectId: "zero-sum-rpg-2026",
  appId: "1:941946145190:web:89539148cced56ecf42767",
  storageBucket: "zero-sum-rpg-2026.firebasestorage.app",
  apiKey: "AIzaSyCAPKXPuhtVJ48dXIP5ZlEXk5jI_3fpWd0",
  authDomain: "zero-sum-rpg-2026.firebaseapp.com",
  messagingSenderId: "941946145190",
  databaseURL: "https://zero-sum-rpg-2026-default-rtdb.europe-west1.firebasedatabase.app"
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./app.component.css'],
  template: `
    <div class="crt-overlay"></div>
    
    <!-- LOBBY SCREEN -->
    <div *ngIf="!sessionId()" class="lobby-container">
      <h1 class="text-neon-blue" style="font-size: 64px; margin-bottom: 10px;">ZERO SUM</h1>
      <div style="color: gray; letter-spacing: 5px; margin-bottom: 40px;">UPLINK TERMINAL</div>
      
      <input type="text" class="pin-input" placeholder="SESSION PIN" maxlength="6" (input)="onPinInput($event)" />
      
      <div style="display: flex; gap: 20px; flex-wrap: wrap;">
        <button class="cyber-button" (click)="joinSession('spectator')">SPECTATE</button>
        <button class="cyber-button" style="border-color: #FF2A2A; color: #FF2A2A" (click)="joinSession('gm')">GM OVERRIDE</button>
        <button class="cyber-button" style="border-color: #00E5FF; color: #00E5FF" (click)="joinSession('billboard')">CORPORATE BILLBOARD</button>
        <button class="cyber-button" style="border-color: #00FF00; color: #00FF00" (click)="joinSession('netrunner')">NETRUNNER SHELL</button>
      </div>
    </div>

    <!-- MAIN DASHBOARD -->
    <div *ngIf="sessionId()" style="padding: 20px; height: 100vh; box-sizing: border-box; display: flex; flex-direction: column;">
      
      @defer (when isGmMode()) {
        <!-- GM Map Builder Logic here -->
        <header class="glass-panel gm-panel" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h1 style="margin: 0;">ZERO SUM <span class="text-neon-red">GM OVERRIDE</span></h1>
          <div style="font-size: 14px; color: gray;">SESSION: <strong style="color: white">{{ sessionId() }}</strong></div>
        </header>
        
        <div class="dashboard-grid" style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; flex: 1; overflow: hidden;">
            <div class="glass-panel gm-panel" style="flex: 1; overflow-y: auto;">
              <h2 class="text-neon-red">Graphical Map Builder & Sub-Sector Routing</h2>
              <input type="text" [(ngModel)]="builderMapArchetype" placeholder="Archetype" style="background: black; color: white; border: 1px solid #FF2A2A; padding: 5px; width: 100%; margin-bottom: 10px;" />
              <!-- Canvas Tiling WebGPU Mock -->
              <canvas id="gmMapCanvas" width="400" height="400" style="background: #111; border: 1px solid #444; width: 100%; max-width: 400px; display: block; margin: 0 auto;"></canvas>
              <button class="cyber-button" style="border-color: #FF2A2A; color: #FF2A2A; width: 100%; margin-top: 20px;" (click)="publishMap()">PUBLISH WEBGPU MAP</button>

              <h2 class="text-neon-red" style="margin-top: 20px;">Twitch Webhook Control</h2>
              <button class="cyber-button" style="border-color: #00FF00; color: #00FF00;" (click)="simulateTwitchDonation()">SIMULATE CHAOS INJECTION (TWITCH BITS)</button>
              
              <h2 class="text-neon-red">Global Heat Level</h2>
              <button class="cyber-button" (click)="updateHeat(-1)">-</button>
              <span style="font-size: 24px; color: #FF2A2A; font-weight: bold; margin: 0 15px;">{{ heatLevel() }}</span>
              <button class="cyber-button" (click)="updateHeat(1)">+</button>
            </div>
            
            <div class="glass-panel" style="flex: 1; overflow-y: auto; border-color: #FF2A2A;">
              <h2 class="text-neon-red">Zero-Sum Transfer Log (Procedural Guilt)</h2>
              <div *ngFor="let t of getTraumaLog()" style="padding: 10px; border-left: 2px solid #FF2A2A; margin-bottom: 5px; background: rgba(255,42,42,0.1);">
                <strong style="color: white;">{{ t.player }} HEALED +{{ t.amount }}</strong>
                <div style="color: #FF2A2A; font-size: 12px; margin-top: 4px;">CIVILIAN CASUALTY: <strong>{{ t.civilian }}</strong></div>
              </div>
            </div>
        </div>
      }
      
      @defer (when isBillboardMode()) {
        <!-- CORPORATE BILLBOARD TV -->
        <div class="billboard-container" [ngClass]="{'alarm-mode': heatLevel() >= 8 || recentTrauma()}" style="height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center;">
            <h1 [style.color]="heatLevel() >= 8 ? '#FF2A2A' : '#00E5FF'" style="font-size: 120px; margin: 0; animation: blink 2s infinite;">GLOBAL HEAT: {{ heatLevel() }}</h1>
            <h2 *ngIf="recentTrauma()" style="color: #FF2A2A; font-size: 64px; animation: blink 0.5s infinite; text-align: center; background: rgba(255,42,42,0.1); padding: 20px; border: 4px solid #FF2A2A;">
                LIFE SUPPORT REDIRECTED.<br/>CASUALTY: {{ recentTrauma().civilian }}
            </h2>
            <div style="margin-top: 50px; border: 2px solid #00E5FF; padding: 20px; width: 80%; background: rgba(0,229,255,0.05);">
                <h3 style="color: #00E5FF; text-align: center; font-size: 48px;">TWITCH CHAOS MARKET: $ {{ chaosMarketValue() }}</h3>
            </div>
        </div>
      }
      
      @defer (when isNetrunnerMode()) {
        <!-- NETRUNNER ICE TERMINAL -->
        <div class="terminal" style="background: black; color: #00FF00; font-family: monospace; height: 100%; padding: 20px; border: 2px solid #00FF00; box-shadow: 0 0 20px rgba(0,255,0,0.2);">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #00FF00; padding-bottom: 10px;">
            <h2 style="margin: 0;">INFOSEC MAINFRAME // AI-DRIVEN ICE</h2>
            <button class="cyber-button" style="border-color: #00FF00; color: #00FF00; padding: 5px 10px; margin: 0; font-size: 12px;" (click)="connectBleBeacon()">[BLE AIR-GAP] CONNECT BEACON</button>
          </div>
          <div style="height: 80%; overflow-y: auto; margin-top: 10px; margin-bottom: 20px;" id="terminalOutput">
            <div *ngFor="let log of terminalLogs()">> {{ log }}</div>
          </div>
          <div style="display: flex; align-items: center;">
            <span style="font-size: 18px; margin-right: 10px;">$</span>
            <input type="text" [(ngModel)]="terminalCommand" (keyup.enter)="executeIceCommand()" style="background: black; color: #00FF00; border: none; outline: none; width: 100%; font-size: 18px;" placeholder="grep the mainframe..." autofocus />
          </div>
        </div>
      }
      
      @defer (when isSpectatorMode()) {
        <div class="glass-panel" style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center;">
            <h2 class="text-neon-blue" style="font-size: 48px;">SPECTATOR UPLINK // TWITCH</h2>
            <div style="color: #00E5FF; font-size: 64px; margin: 20px 0;">Market Value: $ {{ chaosMarketValue() }}</div>
            <div style="color: #FF2A2A; font-size: 64px;">Heat Level: {{ heatLevel() }}</div>
        </div>
      }

    </div>
  `
})
export class AppComponent implements OnInit {
  gameState = signal<any>({ characters: {}, map: null, traumaLog: {} });
  heatLevel = computed(() => this.gameState().heatLevel || 1);
  chaosMarketValue = computed(() => this.gameState().chaosMarketValue || 0);
  
  sessionId = signal<string | null>(null);
  mode = signal<string | null>(null);
  
  isGmMode = computed(() => this.mode() === 'gm');
  isBillboardMode = computed(() => this.mode() === 'billboard');
  isNetrunnerMode = computed(() => this.mode() === 'netrunner');
  isSpectatorMode = computed(() => this.mode() === 'spectator');

  inputPin: string = '';
  private db: any;
  
  builderMapArchetype = 'Custom Facility';
  terminalCommand = '';
  terminalLogs = signal<string[]>(['System Ready. Declarative Web MCP initialized.', 'Local LLM ICE loaded.', 'Awaiting command...']);
  
  recentTrauma = signal<any>(null);

  constructor() {
    // IoT Web Audio API Siren Effect
    effect(() => {
      const heat = this.heatLevel();
      if (heat >= 8 && this.isBillboardMode()) {
         this.playSiren();
      }
    });
    
    // Procedural Guilt Flashing Effect
    effect(() => {
       const state = this.gameState();
       if (state.traumaLog) {
         const keys = Object.keys(state.traumaLog);
         if (keys.length > 0) {
           const latest = state.traumaLog[keys[keys.length - 1]];
           this.recentTrauma.set(latest);
           setTimeout(() => this.recentTrauma.set(null), 10000); // clear after 10s
         }
       }
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const session = params.get('session');
      const m = params.get('mode');
      
      if (session) {
        this.sessionId.set(session);
        this.mode.set(m);
        this.connectFirebase();
      }
    }
  }

  onPinInput(event: any) {
    this.inputPin = event.target.value;
  }

  joinSession(selectedMode: string) {
    if (this.inputPin.length >= 4) {
      window.location.href = `/?session=${this.inputPin}&mode=${selectedMode}`;
    }
  }

  connectFirebase() {
    const app = initializeApp(firebaseConfig);
    this.db = getDatabase(app);
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      connectDatabaseEmulator(this.db, 'localhost', 9000);
    }
    const stateRef = ref(this.db, `sessions/${this.sessionId()}/gameState`);
    onValue(stateRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        this.gameState.set(data);
      }
    });
  }

  updateHeat(delta: number) {
    if (!this.db || !this.sessionId()) return;
    const newHeat = Math.max(1, Math.min(10, this.heatLevel() + delta));
    set(ref(this.db, `sessions/${this.sessionId()}/gameState/heatLevel`), newHeat);
  }

  getTraumaLog() {
    const state = this.gameState();
    return state.traumaLog ? Object.values(state.traumaLog) : [];
  }

  publishMap() {
    if (!this.db || !this.sessionId()) return;
    set(ref(this.db, `sessions/${this.sessionId()}/gameState/map`), {
      archetype: this.builderMapArchetype,
      layoutStructure: 'WebGPU Rendered',
      rooms: [] 
    });
  }

  executeIceCommand() {
     const cmd = this.terminalCommand.toLowerCase();
     this.terminalLogs.update(logs => [...logs, cmd]);
     this.terminalCommand = '';
     
     // Mock Local LLM ICE processing
     setTimeout(() => {
       if (cmd.includes('overload')) {
          this.terminalLogs.update(logs => [...logs, 'LLM-ICE: Intrusion detected. Thermal regulators bypassed. Chaos Market crashing...']);
          if (this.db) {
            set(ref(this.db, `sessions/${this.sessionId()}/gameState/chaosMarketValue`), 0);
          }
       } else if (cmd.includes('grep')) {
          this.terminalLogs.update(logs => [...logs, 'LLM-ICE: Analyzing semantic structure...', 'Found 3 matching vectors for life-support thermal regulators.']);
       } else {
          this.terminalLogs.update(logs => [...logs, 'LLM-ICE: Command syntax acknowledged. No lethal action authorized.']);
       }
     }, 1000);
  }

  simulateTwitchDonation() {
     // Twitch Webhooks Mock
     if (!this.db || !this.sessionId()) return;
     const current = this.chaosMarketValue();
     set(ref(this.db, `sessions/${this.sessionId()}/gameState/chaosMarketValue`), current + 500);
  }

  // IoT Web Audio API Siren
  private audioCtx: any = null;
  playSiren() {
     if (typeof window === 'undefined') return;
     if (!this.audioCtx) {
         this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
     }
     const oscillator = this.audioCtx.createOscillator();
     const gainNode = this.audioCtx.createGain();
     
     oscillator.type = 'sawtooth';
     oscillator.frequency.setValueAtTime(400, this.audioCtx.currentTime);
     oscillator.frequency.linearRampToValueAtTime(800, this.audioCtx.currentTime + 1);
     
     gainNode.gain.setValueAtTime(0.1, this.audioCtx.currentTime); // Keep volume low
     gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 1);
     
     oscillator.connect(gainNode);
     gainNode.connect(this.audioCtx.destination);
     
     oscillator.start();
     oscillator.stop(this.audioCtx.currentTime + 1);
  }

  async connectBleBeacon() {
     if (typeof window === 'undefined' || !(window.navigator as any).bluetooth) {
         this.terminalLogs.update(logs => [...logs, 'LLM-ICE: Physical BLE Hardware missing on this terminal. Air-gap hack impossible.']);
         return;
     }
     try {
         this.terminalLogs.update(logs => [...logs, 'LLM-ICE: Scanning physical playing room for Bluetooth Low Energy beacons...']);
         const device = await (window.navigator as any).bluetooth.requestDevice({
             acceptAllDevices: true,
             optionalServices: ['battery_service']
         });
         this.terminalLogs.update(logs => [...logs, `LLM-ICE: Connected to ${device.name}. Proximity verified. Mainframe access granted.`]);
     } catch (error: any) {
         this.terminalLogs.update(logs => [...logs, `LLM-ICE: Air-gap connection failed. ${error.message}`]);
     }
  }
}
