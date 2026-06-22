import { Component, OnInit, signal, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, connectDatabaseEmulator, push, get } from 'firebase/database';
import { PixiMapComponent } from './pixi-map.component';
import { GridStore, RoomData } from './grid.store';

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
  imports: [CommonModule, FormsModule, PixiMapComponent],
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

      <div style="margin-top: 30px; font-size: 14px; color: gray;">PROTAGONIST UPLINKS</div>
      <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px;">
        <button *ngFor="let p of protagonistList" class="cyber-button" style="border-color: #00FF00; color: #00FF00" (click)="joinSession('player', p.id)">{{p.name}} ({{p.role}})</button>
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
        
        <div class="dashboard-grid" style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; flex: 1; overflow: hidden; height: 100%;">
            <!-- PANE A: PixiJS Canvas Viewport -->
            <div class="glass-panel gm-panel" style="flex: 1; padding: 0; position: relative;">
               <app-pixi-map 
                  [mode]="'gm'"
                  [characters]="gameState().characters || {}"
                  [activePlayerId]="activePlayerId()"
                  (cellClicked)="onCanvasCellClicked($event)" 
                  (roomClicked)="onCanvasRoomClicked($event)">
               </app-pixi-map>
            </div>
            
            <!-- PANE B: Construction Toolkit -->
            <div class="glass-panel" style="flex: 1; overflow-y: auto; border-color: #FF2A2A; display: flex; flex-direction: column;">
               <div style="display: flex; gap: 10px; margin-bottom: 15px; border-bottom: 1px solid #FF2A2A; padding-bottom: 10px;">
                 <button class="cyber-button" [ngClass]="{'active': activeTab() === 'blocks'}" (click)="activeTab.set('blocks')">BUILDING BLOCKS</button>
                 <button class="cyber-button" [ngClass]="{'active': activeTab() === 'properties'}" (click)="activeTab.set('properties')">PROPERTIES</button>
               </div>

               <div *ngIf="activeTab() === 'blocks'" style="flex: 1;">
                 <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <h3 class="text-neon-blue">Block Pool</h3>
                    <span [ngStyle]="{'color': blockPoolUsed() >= 50 ? 'red' : 'white'}">{{ blockPoolUsed() }} / 50 USED</span>
                 </div>
                 
                 <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px;">
                    <div class="prefab-block" (click)="selectPrefab('corridor')" [ngClass]="{'selected': activePrefab() === 'corridor'}" style="padding: 10px; border: 1px solid gray; cursor: pointer;">Corridor</div>
                    <div class="prefab-block" (click)="selectPrefab('l_junction')" [ngClass]="{'selected': activePrefab() === 'l_junction'}" style="padding: 10px; border: 1px solid gray; cursor: pointer;">L-Junction</div>
                    <div class="prefab-block" (click)="selectPrefab('medbay')" [ngClass]="{'selected': activePrefab() === 'medbay'}" style="padding: 10px; border: 1px solid gray; cursor: pointer;">MedBay</div>
                    <div class="prefab-block" (click)="selectPrefab('data_terminal')" [ngClass]="{'selected': activePrefab() === 'data_terminal'}" style="padding: 10px; border: 1px solid gray; cursor: pointer;">Data Terminal</div>
                 </div>

                 <button class="cyber-button" style="width: 100%; border-color: #00E5FF; color: #00E5FF;" (click)="generateSqueeze()">GENERATE SQUEEZE (WFC)</button>
                 <p *ngIf="wfcError()" style="color: red; font-size: 12px; margin-top: 5px;">{{ wfcError() }}</p>

                 <div style="margin-top: 20px; border-top: 1px dashed gray; padding-top: 10px;">
                    <h3 class="text-neon-red">Global Heat Level</h3>
                    <button class="cyber-button" (click)="updateHeat(-1)">-</button>
                    <span style="font-size: 24px; color: #FF2A2A; font-weight: bold; margin: 0 15px;">{{ heatLevel() }}</span>
                    <button class="cyber-button" (click)="updateHeat(1)">+</button>
                 </div>
                 
                 <button class="cyber-button" style="border-color: #FF2A2A; color: #FF2A2A; width: 100%; margin-top: 20px;" (click)="publishMap()">SYNC GRID TO RTDB</button>
                 <button class="cyber-button" style="border-color: #FF00FF; color: #FF00FF; width: 100%; margin-top: 20px;" (click)="simulateChaos()">SIMULATE 7-PLAYER CHAOS</button>
               </div>

               <div *ngIf="activeTab() === 'properties'" style="flex: 1;">
                 <div *ngIf="selectedRoomId(); else noSelection">
                   <h3 class="text-neon-red">Room: {{ selectedRoomId() }}</h3>
                   
                   <label style="color: gray; font-size: 12px;">Metadata Tag</label>
                   <input type="text" [ngModel]="getRoomTag()" (ngModelChange)="updateRoomTag($event)" style="background: black; color: white; border: 1px solid gray; padding: 5px; width: 100%; margin-bottom: 10px;" />

                   <label style="color: gray; font-size: 12px;">Dynamic VFX</label>
                   <select [ngModel]="getRoomVfx()" (ngModelChange)="updateRoomVfx($event)" style="background: black; color: white; border: 1px solid gray; padding: 5px; width: 100%; margin-bottom: 10px;">
                     <option value="none">None</option>
                     <option value="flash_red_alert">Security Alarm (Red Pulse)</option>
                     <option value="flicker_blue_data">Data Stream (Blue Flicker)</option>
                     <option value="glitch">Glitch Effect</option>
                   </select>

                   <label style="color: gray; font-size: 12px;">Threat Level</label>
                   <select [ngModel]="getRoomThreat()" (ngModelChange)="updateRoomThreat($event)" style="background: black; color: white; border: 1px solid gray; padding: 5px; width: 100%; margin-bottom: 10px;">
                     <option value="low">Low</option>
                     <option value="medium">Medium</option>
                     <option value="critical">Critical</option>
                   </select>
                   <button class="cyber-button" style="border-color: #FF2A2A; color: #FF2A2A; width: 100%; margin-top: 20px;" (click)="publishMap()">SYNC ROOM STATE TO RTDB</button>
                 </div>
                 <ng-template #noSelection>
                    <div style="color: gray; font-style: italic;">Select a room on the canvas to view properties.</div>
                 </ng-template>
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
        <div class="glass-panel" style="flex: 1; display: flex; flex-direction: column; overflow: hidden;">
            <h2 class="text-neon-blue" style="font-size: 24px;">SPECTATOR UPLINK // TWITCH</h2>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <div style="color: #00E5FF; font-size: 32px;">Market Value: $ {{ chaosMarketValue() }}</div>
              <div style="color: #FF2A2A; font-size: 32px;">Heat Level: {{ heatLevel() }}</div>
            </div>
            
            <div style="flex: 1; position: relative;">
              <app-pixi-map [mode]="'spectator'" [characters]="gameState().characters || {}"></app-pixi-map>
            </div>
        </div>
      }

      @defer (when isPlayerMode()) {
        <div class="glass-panel" style="flex: 1; display: flex; flex-direction: column; overflow: hidden;">
            <h2 class="text-neon-blue" style="font-size: 24px;">UPLINK // {{ getPlayerName() }}</h2>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <div style="color: #00FF00; font-size: 18px;">ROLE: {{ getPlayerRole() }}</div>
              <div style="color: #FF2A2A; font-size: 18px;">Heat Level: {{ heatLevel() }}</div>
            </div>
            
            <div style="flex: 1; position: relative;">
              <app-pixi-map [mode]="'player'" [characters]="gameState().characters || {}" [activePlayerId]="activePlayerId()"></app-pixi-map>
            </div>
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
  activePlayerId = signal<string | null>(null);
  
  isGmMode = computed(() => this.mode() === 'gm');
  isBillboardMode = computed(() => this.mode() === 'billboard');
  isNetrunnerMode = computed(() => this.mode() === 'netrunner');
  isSpectatorMode = computed(() => this.mode() === 'spectator');
  isPlayerMode = computed(() => this.mode() === 'player');

  protagonistList = [
     { id: 'p1', name: 'S. Nakamura', role: 'Combat' },
     { id: 'p2', name: 'E. Vance', role: 'Infiltrator' },
     { id: 'p3', name: 'J. Doe', role: 'Ghost' },
     { id: 'p4', name: 'K. Quinn', role: 'Tech' },
     { id: 'p5', name: 'R. Doberman', role: 'Heavy' },
     { id: 'p6', name: 'Dr. Mercer', role: 'Medic' },
     { id: 'p7', name: 'V. Solis', role: 'Sniper' }
  ];

  getPlayerName() {
     const p = this.protagonistList.find(x => x.id === this.activePlayerId());
     return p ? p.name : 'UNKNOWN';
  }

  getPlayerRole() {
     const p = this.protagonistList.find(x => x.id === this.activePlayerId());
     return p ? p.role : 'UNKNOWN';
  }

  inputPin: string = '';
  private db: any;
  private chaosInterval: any;
  
  builderMapArchetype = 'Custom Facility';
  terminalCommand = '';
  terminalLogs = signal<string[]>(['System Ready. Declarative Web MCP initialized.', 'Local LLM ICE loaded.', 'Awaiting command...']);
  
  recentTrauma = signal<any>(null);

  // Architect Store and UI State
  gridStore = inject(GridStore);
  activeTab = signal<'blocks' | 'properties'>('blocks');
  activePrefab = signal<string>('corridor');
  selectedRoomId = signal<string | null>(null);
  selectedCell = signal<{x: number, y: number} | null>(null);
  blockPoolUsed = computed(() => Object.keys(this.gridStore.grid() || {}).length);
  wfcError = signal<string | null>(null);

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
      const player = params.get('player');
      
      if (session) {
        this.sessionId.set(session);
        this.mode.set(m);
        if (player) this.activePlayerId.set(player);
        this.connectFirebase();
      }
    }
  }

  ngOnDestroy() {
     if (this.chaosInterval) clearInterval(this.chaosInterval);
  }

  // --- PixiJS & WFC Builder Methods ---
  
  onCanvasCellClicked(pos: {x: number, y: number}) {
    if (this.blockPoolUsed() >= 50) return; // 50 block limit
    this.selectedRoomId.set(null);
    this.activeTab.set('blocks');
    
    // Instantiate prefab at clicked location
    const roomId = `room_${Math.random().toString(36).substr(2, 6)}`;
    const prefabType = this.activePrefab();
    
    // Create new structure based on prefab (simulated 2x2 for simplicity)
    const newRoomData: RoomData = {
      tag: prefabType.toUpperCase(),
      bounds: { x: pos.x, y: pos.y, w: 2, h: 2 },
      metadata: { vfx: 'none', threat: 'low' }
    };
    
    this.gridStore.updateRoom(roomId, newRoomData);
    
    // Occupy grid cells
    for(let dx=0; dx<2; dx++) {
      for(let dy=0; dy<2; dy++) {
         this.gridStore.updateCell(pos.x + dx, pos.y + dy, { type: 'structure_wall', room_id: roomId });
      }
    }
  }

  onCanvasRoomClicked(roomId: string) {
    this.selectedRoomId.set(roomId);
    this.activeTab.set('properties');
  }

  selectPrefab(prefabName: string) {
    this.activePrefab.set(prefabName);
  }

  generateSqueeze() {
    this.wfcError.set(null);
    let attempts = 0;
    const maxAttempts = 500;
    
    while(attempts < maxAttempts) {
      // Mock WFC generation logic
      attempts++;
      if (Math.random() > 0.99) { // 1% chance of success in mock
         // Success
         this.wfcError.set("WFC Generated successfully.");
         return;
      }
    }
    
    this.wfcError.set("WFC generation failed: Maximum recursion depth reached. Reverted.");
  }

  getRoomTag() {
    const roomId = this.selectedRoomId();
    return roomId ? this.gridStore.rooms()[roomId]?.tag || '' : '';
  }
  updateRoomTag(tag: string) {
    const roomId = this.selectedRoomId();
    if (roomId) {
       const room = { ...this.gridStore.rooms()[roomId], tag };
       this.gridStore.updateRoom(roomId, room);
    }
  }

  getRoomVfx() {
    const roomId = this.selectedRoomId();
    return roomId ? this.gridStore.rooms()[roomId]?.metadata?.vfx || 'none' : 'none';
  }
  updateRoomVfx(vfx: string) {
    const roomId = this.selectedRoomId();
    if (roomId) {
       const room = this.gridStore.rooms()[roomId];
       const updatedRoom = { ...room, metadata: { ...room.metadata, vfx } };
       this.gridStore.updateRoom(roomId, updatedRoom);
    }
  }

  getRoomThreat() {
    const roomId = this.selectedRoomId();
    return roomId ? this.gridStore.rooms()[roomId]?.metadata?.threat || 'low' : 'low';
  }
  updateRoomThreat(threat: string) {
    const roomId = this.selectedRoomId();
    if (roomId) {
       const room = this.gridStore.rooms()[roomId];
       const updatedRoom = { ...room, metadata: { ...room.metadata, threat } };
       this.gridStore.updateRoom(roomId, updatedRoom);
    }
  }


  getCharacterKeys() {
    return this.gameState() && this.gameState().characters ? Object.keys(this.gameState().characters) : [];
  }

  onPinInput(event: any) {
    this.inputPin = event.target.value;
  }

  joinSession(selectedMode: string, playerId?: string) {
    if (this.inputPin.length >= 4) {
      let url = `/?session=${this.inputPin}&mode=${selectedMode}`;
      if (playerId) url += `&player=${playerId}`;
      window.location.href = url;
    }
  }

  simulateChaos() {
      if (!this.db || !this.sessionId()) return;
      const chars: Record<string, any> = {};
      
      // Spawn players somewhat centrally (e.g. 20-30 range on 50x30 map)
      this.protagonistList.forEach((p, idx) => {
         chars[p.id] = { 
            id: p.id, 
            name: p.name, 
            role: p.role, 
            x: 20 + Math.floor(Math.random()*10), 
            y: 10 + Math.floor(Math.random()*10), 
            fowRadius: 5 + Math.floor(Math.random()*4) 
         };
      });
      set(ref(this.db, `sessions/${this.sessionId()}/gameState/characters`), chars);

      // Random move interval
      if (this.chaosInterval) clearInterval(this.chaosInterval);
      this.chaosInterval = setInterval(() => {
         const currentChars = this.gameState().characters;
         if (currentChars) {
            const updated = { ...currentChars };
            Object.values(updated).forEach((c: any) => {
               // Random walk
               if (Math.random() > 0.3) {
                   c.x += Math.floor(Math.random() * 3) - 1;
                   c.y += Math.floor(Math.random() * 3) - 1;
                   // keep in bounds roughly
                   if (c.x < 0) c.x = 0; if (c.x > 49) c.x = 49;
                   if (c.y < 0) c.y = 0; if (c.y > 29) c.y = 29;
               }
            });
            set(ref(this.db, `sessions/${this.sessionId()}/gameState/characters`), updated);
         }
      }, 1500);
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
        if (data.grid && data.rooms) {
           this.gridStore.setState({
             grid: data.grid || {},
             rooms: data.rooms || {},
             dimensions: data.dimensions || { width: 50, height: 30 }
           });
        }
      }
    });
  }

  updateHeat(delta: number) {
    if (!this.db || !this.sessionId()) return;
    const newHeat = Math.max(1, Math.min(10, this.heatLevel() + delta));
    set(ref(this.db, `sessions/${this.sessionId()}/gameState/heatLevel`), newHeat);
  }

  getTraumaLog(): any[] {
    const state = this.gameState();
    return state.traumaLog ? Object.values(state.traumaLog) : [];
  }

  publishMap() {
    if (!this.db || !this.sessionId()) return;
    set(ref(this.db, `sessions/${this.sessionId()}/gameState`), {
      ...this.gameState(),
      dimensions: this.gridStore.dimensions(),
      grid: this.gridStore.grid(),
      rooms: this.gridStore.rooms()
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
     
     gainNode.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
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
