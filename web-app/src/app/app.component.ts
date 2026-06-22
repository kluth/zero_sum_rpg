import { Component, OnInit, signal, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, connectDatabaseEmulator, push, get } from 'firebase/database';
import { PixiMapComponent } from './pixi-map.component';
import { ProgressClockComponent } from './progress-clock.component';
import { FlashbackOverlayComponent } from './flashback-overlay.component';
import { GridStore, RoomData } from './grid.store';
import { executeEmergencyHeal, EmergencyHealCommand } from '@core-domain/ledger/EmergencyHeal';
import { PlayerCharacter, CivilianEntity } from '@core-domain/ledger/Entities';

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
  imports: [CommonModule, FormsModule, PixiMapComponent, ProgressClockComponent, FlashbackOverlayComponent],
  styleUrls: ['./app.component.css'],
  template: `
    <div class="crt-overlay"></div>
    <app-flashback-overlay [isActive]="flashbackActive()" [initiatingPlayer]="flashbackPlayer()" [description]="flashbackDescription()"></app-flashback-overlay>
    
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
      
      <!-- Pulsating Alert Bar -->
      <div *ngIf="heatLevel() >= 8 || recentTrauma()" class="pulsating-alert-bar" style="background: #FF2A2A; color: white; padding: 10px; font-weight: bold; text-align: center; border: 2px solid #FFFFFF; margin-bottom: 15px; font-family: monospace;">
        ⚠️ CRITICAL ALERT: {{ heatLevel() >= 8 ? 'HIGH HEAT LEVEL DETECTED (' + heatLevel() + '/10). ' : '' }} {{ recentTrauma() ? 'LIFE SUPPORT SYSTEM FAILURE: ' + recentTrauma().civilian : '' }}
      </div>

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
                  [paintMode]="activePaintMode()"
                  (cellClicked)="onCanvasCellClicked($event)" 
                  (roomClicked)="onCanvasRoomClicked($event)"
                  (cellPainted)="onCellPainted($event)">
               </app-pixi-map>
            </div>
            
            <!-- PANE B: Construction Toolkit -->
            <div class="glass-panel" style="flex: 1; overflow-y: auto; border-color: #FF2A2A; display: flex; flex-direction: column;">
               <div style="display: flex; gap: 10px; margin-bottom: 15px; border-bottom: 1px solid #FF2A2A; padding-bottom: 10px;">
                 <button class="cyber-button" [ngClass]="{'active': activeTab() === 'blocks'}" (click)="setTab('blocks')">BUILDING BLOCKS</button>
                 <button class="cyber-button" [ngClass]="{'active': activeTab() === 'paint'}" (click)="setTab('paint')">TILE PAINTER</button>
                 <button class="cyber-button" [ngClass]="{'active': activeTab() === 'properties'}" (click)="setTab('properties')">PROPERTIES</button>
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
                 <button class="cyber-button" style="border-color: #FF00FF; color: #FF00FF; width: 100%; margin-top: 10px;" (click)="simulateChaos()">SIMULATE 7-PLAYER CHAOS</button>
                 <button class="cyber-button donation-btn" style="border-color: #FF00FF; color: #FF00FF; width: 100%; margin-top: 10px;" (click)="simulateTwitchDonation()">SIMULATE TWITCH DONATION</button>
               </div>

               <div *ngIf="activeTab() === 'paint'" style="flex: 1;">
                 <h3 class="text-neon-blue">Tile Painter</h3>
                 <p style="color: gray; font-size: 12px; margin-bottom: 10px;">Drag on the canvas to paint individual grid cells. Note: Walls and Locked Doors will block player Line of Sight.</p>
                 <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px;">
                    <div class="prefab-block" (click)="activePaintMode.set('wall')" [ngClass]="{'selected': activePaintMode() === 'wall'}" style="padding: 10px; border: 1px solid #00E5FF; cursor: pointer; color: #00E5FF;">Neon Wall</div>
                    <div class="prefab-block" (click)="activePaintMode.set('door_locked')" [ngClass]="{'selected': activePaintMode() === 'door_locked'}" style="padding: 10px; border: 1px solid #FF003C; cursor: pointer; color: #FF003C;">Locked Door</div>
                    <div class="prefab-block" (click)="activePaintMode.set('door_open')" [ngClass]="{'selected': activePaintMode() === 'door_open'}" style="padding: 10px; border: 1px solid #00FF66; cursor: pointer; color: #00FF66;">Open Door</div>
                    <div class="prefab-block" (click)="activePaintMode.set('cctv')" [ngClass]="{'selected': activePaintMode() === 'cctv'}" style="padding: 10px; border: 1px solid #FFFF00; cursor: pointer; color: #FFFF00;">CCTV Node</div>
                    <div class="prefab-block" (click)="activePaintMode.set('furniture')" [ngClass]="{'selected': activePaintMode() === 'furniture'}" style="padding: 10px; border: 1px solid #888888; cursor: pointer; color: #888888;">Furniture</div>
                    <div class="prefab-block" (click)="activePaintMode.set('floor')" [ngClass]="{'selected': activePaintMode() === 'floor'}" style="padding: 10px; border: 1px solid gray; cursor: pointer; color: gray;">Eraser (Floor)</div>
                 </div>
                 <button class="cyber-button" style="border-color: #FF2A2A; color: #FF2A2A; width: 100%; margin-top: 20px;" (click)="publishMap()">SYNC GRID TO RTDB</button>
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
        <div class="glass-panel" style="flex: 1; display: flex; flex-direction: column; overflow: hidden; border-color: #00E5FF;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #00E5FF; padding-bottom: 10px; margin-bottom: 15px;">
              <h2 class="text-neon-blue" style="font-size: 24px; margin: 0;">SPECTATOR UPLINK // TWITCH</h2>
              <div style="display: flex; gap: 20px; align-items: center;">
                <button class="cyber-button donation-btn" style="border-color: #FF00FF; color: #FF00FF; font-size: 14px; margin-top: 0; padding: 5px 15px;" (click)="simulateTwitchDonation()">SIMULATE TWITCH DONATION</button>
                <div style="color: #00E5FF; font-size: 24px; font-weight: bold;">Market Value: $ {{ chaosMarketValue() }}</div>
                <div style="color: #FF2A2A; font-size: 24px; font-weight: bold;">Heat Level: {{ heatLevel() }}</div>
              </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 300px 1fr 300px; gap: 20px; flex: 1; overflow: hidden;">
              <!-- Left column: Scrolling logs panel -->
              <div class="glass-panel left-pane" style="display: flex; flex-direction: column; overflow: hidden; border-color: #00E5FF; padding: 10px;">
                <h3 class="text-neon-blue" style="margin-top: 0; font-size: 16px; border-bottom: 1px solid #00E5FF; padding-bottom: 5px;">LIVE FEED & DONATIONS</h3>
                <div style="flex: 1; overflow-y: auto; font-family: monospace; font-size: 12px; color: #00FF00;" class="scrolling-logs">
                  <div *ngFor="let roll of gameState().recentRolls || []" style="border-bottom: 1px dashed rgba(0,255,0,0.2); padding: 5px 0;">
                    [{{ roll.timestamp | date:'HH:mm:ss' }}] ROLL: {{ roll.player }} rolled D20 -> {{ roll.result }}
                  </div>
                  <div *ngIf="chaosMarketValue() > 0" style="color: #FF00FF; padding: 5px 0; border-bottom: 1px dashed rgba(255,0,255,0.2);">
                    [TWITCH] Anonymous donation received! Market value: $ {{ chaosMarketValue() }}
                  </div>
                </div>
              </div>
              
              <!-- Center column: PixiJS map canvas -->
              <div style="position: relative; display: flex; flex-direction: column; overflow: hidden;">
                <div style="flex: 1; position: relative;">
                  <app-pixi-map [mode]="'spectator'" [characters]="gameState().characters || {}"></app-pixi-map>
                </div>
              </div>
              
              <!-- Right column: Squad status cards and Clocks -->
              <div class="glass-panel right-pane" style="display: flex; flex-direction: column; overflow-y: auto; border-color: #00E5FF; padding: 10px;">
                <h3 class="text-neon-blue" style="margin-top: 0; font-size: 16px; border-bottom: 1px solid #00E5FF; padding-bottom: 5px;">THREAT CLOCKS</h3>
                <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px;">
                  <app-progress-clock *ngFor="let clock of getPublicClocks()" 
                      [name]="clock.name" [segments]="clock.segments" [filled]="clock.filled" [color]="clock.color">
                  </app-progress-clock>
                  <div *ngIf="getPublicClocks().length === 0" style="color: gray; font-style: italic;">No active threats.</div>
                </div>
                
                <h3 class="text-neon-blue" style="margin-top: 0; font-size: 16px; border-bottom: 1px solid #00E5FF; padding-bottom: 5px;">SQUAD STATUS</h3>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                  <div *ngFor="let key of getCharacterKeys()" class="squad-card" style="border: 1px solid #00E5FF; padding: 8px; background: rgba(0,229,255,0.05); font-family: monospace; font-size: 11px;">
                    <div style="color: #00FF00; font-weight: bold; border-bottom: 1px solid #00E5FF; padding-bottom: 3px; margin-bottom: 5px;">
                      {{ gameState().characters[key].name }}
                    </div>
                    <div style="color: gray; margin-bottom: 2px;">ROLE: {{ gameState().characters[key].role }}</div>
                    <div style="display: flex; justify-content: space-between;">
                      <span [style.color]="(gameState().characters[key].stats?.hp_current || 100) < 30 ? '#FF2A2A' : '#FFFFFF'">HP: {{ gameState().characters[key].stats?.hp_current || 100 }}%</span>
                      <span [style.color]="(gameState().characters[key].stats?.stealth_total || 0) >= 50 ? '#00FF00' : '#FF2A2A'">Stealth: {{ gameState().characters[key].stats?.stealth_total || 0 }}</span>
                      <span [style.color]="(gameState().characters[key].stats?.stress_current || 0) >= 70 ? '#FF2A2A' : '#FFFFFF'">Stress: {{ gameState().characters[key].stats?.stress_current || 0 }}</span>
                    </div>
                  </div>
                  <div *ngIf="getCharacterKeys().length === 0" style="color: gray; font-style: italic;">
                    No active characters.
                  </div>
                </div>
              </div>
            </div>
        </div>
      }

      @defer (when isPlayerMode()) {
        <div class="glass-panel" style="flex: 1; display: flex; flex-direction: column; overflow: hidden;">
            <h2 class="text-neon-blue" style="font-size: 24px;">UPLINK // {{ getPlayerName() }}</h2>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <div style="color: #00FF00; font-size: 18px;">ROLE: {{ getPlayerRole() }}</div>
              <button class="cyber-button" style="border-color: #FF00FF; color: #FF00FF; font-size: 12px; margin: 0; padding: 5px 15px;" (click)="triggerEmergencyHeal()">[ZERO SUM] EMERGENCY HEAL</button>
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
  gameState = signal<any>({ characters: {}, map: null, traumaLog: {}, clocks: {}, flashbacks: {} });
  heatLevel = computed(() => this.gameState().heatLevel || 1);
  chaosMarketValue = computed(() => this.gameState().chaosMarketValue || 0);
  
  getPublicClocks(): any[] {
    const clocks = this.gameState().clocks || {};
    return Object.values(clocks).filter((c: any) => c.isVisible);
  }

  flashbackActive = computed(() => {
    const fb = this.gameState().flashbacks || {};
    const active = Object.values(fb).find((f: any) => f.status === 'active');
    return !!active;
  });

  flashbackPlayer = computed(() => {
    const fb = this.gameState().flashbacks || {};
    const active: any = Object.values(fb).find((f: any) => f.status === 'active');
    if (!active) return '';
    const chars = this.gameState().characters || {};
    return chars[active.char_id]?.name || active.char_id;
  });

  flashbackDescription = computed(() => {
    const fb = this.gameState().flashbacks || {};
    const active: any = Object.values(fb).find((f: any) => f.status === 'active');
    return active ? active.description : '';
  });
  
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
  activeTab = signal<'blocks' | 'paint' | 'properties'>('blocks');
  activePrefab = signal<string>('corridor');
  activePaintMode = signal<string | null>(null);
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
  setTab(tab: 'blocks' | 'paint' | 'properties') {
    this.activeTab.set(tab);
    if (tab === 'paint') {
      this.activePaintMode.set('wall');
    } else {
      this.activePaintMode.set(null);
    }
  }

  onCellPainted(event: {x: number, y: number, type: string}) {
    if (event.type === 'floor') {
      // Treat 'floor' as eraser
      this.gridStore.updateCell(event.x, event.y, { type: 'empty' } as any);
    } else {
      this.gridStore.updateCell(event.x, event.y, { type: event.type } as any);
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
      
      const rooms = this.gridStore.rooms();
      const roomKeys = Object.keys(rooms);
      
      this.protagonistList.forEach((p, idx) => {
         let cx = 20, cy = 15;
         if (roomKeys.length > 0) {
            const r = rooms[roomKeys[idx % roomKeys.length]];
            cx = r.bounds.x + Math.floor(r.bounds.w / 2);
            cy = r.bounds.y + Math.floor(r.bounds.h / 2);
         }
         chars[p.id] = { 
            id: p.id, 
            name: p.name, 
            role: p.role, 
            x: cx, 
            y: cy, 
            fowRadius: 5 + Math.floor(Math.random()*4),
            stats: {
                hp_current: 50 + Math.floor(Math.random() * 51),
                hp_max: 100,
                stealth_base: 20 + Math.floor(Math.random() * 81),
                stealth_total: 20 + Math.floor(Math.random() * 81),
                stress_current: Math.floor(Math.random() * 101),
                stress_max: 100,
                snr_threshold_base: 10,
                snr_threshold_total: 10
            },
            active_conditions: [],
            modifiers: []
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
               // Fluctuate stats
               if (!c.stats) c.stats = { hp_current: 100, hp_max: 100, stealth_total: 50, stealth_base: 50, stress_current: 0, stress_max: 100, snr_threshold_base: 10, snr_threshold_total: 10 };
               c.stats.hp_current = Math.max(0, Math.min(100, (c.stats.hp_current || 80) + Math.floor(Math.random() * 11) - 5));
               c.stats.stealth_total = Math.max(0, Math.min(100, (c.stats.stealth_total || 60) + Math.floor(Math.random() * 21) - 10));
               c.stats.stress_current = Math.max(0, Math.min(100, (c.stats.stress_current || 20) + Math.floor(Math.random() * 21) - 10));
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
        data.characters = data.characters || {};
        data.traumaLog = data.traumaLog || {};
        this.gameState.set(data);
        
        if (data.map) {
           this.gridStore.setState({
             grid: data.map.grid || {},
             rooms: data.map.rooms || {},
             dimensions: data.map.dimensions || { width: 50, height: 30 }
           });
        }
      }
    });

    const clocksRef = ref(this.db, `sessions/${this.sessionId()}/clocks`);
    onValue(clocksRef, (snapshot) => {
      this.gameState.update(s => ({ ...s, clocks: snapshot.val() || {} }));
    });

    const flashbacksRef = ref(this.db, `sessions/${this.sessionId()}/flashbacks`);
    onValue(flashbacksRef, (snapshot) => {
      this.gameState.update(s => ({ ...s, flashbacks: snapshot.val() || {} }));
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
    set(ref(this.db, `sessions/${this.sessionId()}/gameState/map`), {
      dimensions: this.gridStore.dimensions(),
      grid: this.gridStore.grid(),
      rooms: this.gridStore.rooms()
    });
  }

  executeIceCommand() {
     const cmd = this.terminalCommand.toLowerCase().trim();
     this.terminalLogs.update(logs => [...logs, cmd]);
     this.terminalCommand = '';
     
     // Mock Local LLM ICE processing
     setTimeout(() => {
       if (cmd === 'help') {
          this.terminalLogs.update(logs => [
             ...logs, 
             'LLM-ICE: Command Assistance Menu:', 
             '  help     - Display all available commands', 
             '  grep     - Query mainframe semantic structure', 
             '  overload - Bypass thermal regulators'
          ]);
       } else if (cmd.includes('overload')) {
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
     const newValue = current + Math.floor(Math.random() * 50) + 10;
     set(ref(this.db, `sessions/${this.sessionId()}/gameState/chaosMarketValue`), newValue);
  }

  triggerEmergencyHeal() {
    if (!this.db || !this.sessionId() || !this.activePlayerId()) return;

    const chars = this.gameState().characters || {};
    const myChar = chars[this.activePlayerId()!];
    if (!myChar) return;

    // Build Hexagonal Adapters (Map JSON state to Domain Entities)
    const playerEntity: PlayerCharacter = {
      id: this.activePlayerId()!,
      name: myChar.name || 'Unknown',
      role: myChar.role || 'Unknown',
      stats: {
        hp_current: myChar.stats?.hp_current || 100,
        hp_max: myChar.stats?.hp_max || 100,
        stress_current: myChar.stats?.stress_current || 0,
        stress_max: myChar.stats?.stress_max || 100,
        stealth_base: myChar.stats?.stealth_base || 10,
        stealth_total: myChar.stats?.stealth_total || 10,
        snr_threshold_base: myChar.stats?.snr_threshold_base || 10,
        snr_threshold_total: myChar.stats?.snr_threshold_total || 10
      },
      active_conditions: myChar.active_conditions || [],
      modifiers: myChar.modifiers || [],
      isDead: (myChar.stats?.hp_current || 100) <= 0
    };

    // Dummy civilian population for now (normally fetched from Firebase)
    const availableCivilians: CivilianEntity[] = [
      { id: 'civ-1', name: 'Maintenance Tech 44', lifeSupport: 100, isAlive: true },
      { id: 'civ-2', name: 'Dr. Aris Thorne', lifeSupport: 50, isAlive: true }
    ];

    const command: EmergencyHealCommand = {
      playerId: playerEntity.id,
      requestedHp: 25,
      player: playerEntity,
      availableCivilians
    };

    // Execute Pure Domain Logic
    const result = executeEmergencyHeal(command);

    if (result.isSuccess()) {
      const successData = result.value;
      
      // Persist State Mutation via Infrastructure Adapter (Firebase)
      const updates: any = {};
      updates[`sessions/${this.sessionId()}/gameState/characters/${this.activePlayerId()}/stats/hp_current`] = successData.newCharacterHp;
      updates[`sessions/${this.sessionId()}/gameState/traumaLog/${successData.generatedCasualty.eventId}`] = successData.generatedCasualty;
      
      import('firebase/database').then(({ update }) => {
        update(ref(this.db!), updates);
      });
      alert(`HEAL SUCCESS. ${successData.actualHpRestored} HP restored. CASUALTY LOGGED: ${successData.generatedCasualty.civilianName}.`);
    } else {
      alert(`HEAL FAILED. Error: ${result.error.message}`);
    }
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
