import { Component, OnInit } from '@angular/core';
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
    <div *ngIf="!sessionId" class="lobby-container">
      <h1 class="text-neon-blue" style="font-size: 64px; margin-bottom: 10px;">ZERO SUM</h1>
      <div style="color: gray; letter-spacing: 5px; margin-bottom: 40px;">UPLINK TERMINAL</div>
      
      <input type="text" class="pin-input" placeholder="SESSION PIN" maxlength="6" (input)="onPinInput($event)" />
      
      <div style="display: flex; gap: 20px;">
        <button class="cyber-button" (click)="joinSession('spectator')">SPECTATE</button>
        <button class="cyber-button" style="border-color: #FF2A2A; color: #FF2A2A" (click)="joinSession('gm')">GM OVERRIDE</button>
      </div>
    </div>

    <!-- MAIN DASHBOARD -->
    <div *ngIf="sessionId" style="padding: 20px; height: 100vh; box-sizing: border-box; display: flex; flex-direction: column;">
      <header class="glass-panel" [ngClass]="{'gm-panel': isGmMode}" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h1 style="margin: 0;">ZERO SUM <span [ngClass]="isGmMode ? 'text-neon-red' : 'text-neon-blue'">{{ isGmMode ? 'GM OVERRIDE' : 'SPECTATOR VIEW' }}</span></h1>
        <div style="font-size: 14px; color: gray;">SESSION: <strong style="color: white">{{ sessionId }}</strong> &nbsp;|&nbsp; TWITCH FIREBASE ACTIVE 🔴</div>
      </header>

      <div class="dashboard-grid" style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; flex: 1; overflow: hidden;">
        
        <!-- Left Column: Map & Intel -->
        <div style="display: flex; flex-direction: column; gap: 20px; overflow-y: auto;">
          
          <!-- Tactical Map (Spectator/Player View) -->
          <div *ngIf="!isGmMode" class="glass-panel" style="flex: 1;">
            <h2 class="text-neon-blue">Tactical Map</h2>
            <div *ngIf="!gameState?.map" style="color: gray;">Awaiting Intel...</div>
            <div *ngIf="gameState?.map">
              <h3 class="text-neon-red" style="margin-bottom: 5px;">{{ gameState.map.archetype }}</h3>
              <p style="color: gray; margin-top: 0;">Layout: {{ gameState.map.layoutStructure }}</p>
              
              <div style="display: grid; gap: 2px; background: #111; padding: 5px; width: 100%; max-width: 400px; margin: 0 auto;"
                   [ngStyle]="{'grid-template-columns': 'repeat(' + gridSize + ', 1fr)'}">
                <div *ngFor="let cell of getSpectatorGrid()" 
                     [ngStyle]="getSpectatorBorders(cell)"
                     style="aspect-ratio: 1; background: #222; position: relative; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 2px;">
                  <ng-container *ngIf="cell.active">
                    <span style="font-size: 8px; font-weight: bold; color: white; text-align: center; word-break: break-all;">{{ cell.name }}</span>
                    <span *ngIf="cell.complication !== 'Clear'" style="color: #FF2A2A; font-size: 12px; font-weight: bold;">!</span>
                  </ng-container>
                </div>
              </div>

            </div>
            
            <div *ngIf="gameState?.sharedAsset" style="margin-top: 20px; border: 1px solid #00E5FF;">
              <h3 class="text-neon-blue" style="margin: 0; padding: 5px; background: rgba(0,229,255,0.2);">BROADCASTED INTEL</h3>
              <img [src]="gameState.sharedAsset" style="width: 100%; display: block;" />
            </div>
          </div>

          <!-- GM Custom Map Builder -->
          <div *ngIf="isGmMode" class="glass-panel gm-panel" style="flex: 1; overflow-y: auto;">
            <h2 class="text-neon-red">Graphical Map Builder & Sub-Sector Routing</h2>
            
            <div style="display: flex; gap: 10px; margin-bottom: 10px;">
              <input type="text" [(ngModel)]="builderMapArchetype" placeholder="Archetype" style="background: black; color: white; border: 1px solid #FF2A2A; padding: 5px; flex: 1;" />
            </div>

            <!-- 2D Grid Builder -->
            <div style="display: grid; gap: 2px; background: #111; padding: 5px; width: 100%; max-width: 400px; margin: 0 auto; margin-bottom: 20px;"
                 [ngStyle]="{'grid-template-columns': 'repeat(' + gridSize + ', 1fr)'}">
              <div *ngFor="let cell of gridCells" 
                   (click)="toggleCell(cell)"
                   (contextmenu)="selectCell(cell, $event)"
                   [ngStyle]="getBorders(cell)"
                   [ngClass]="{'active-cell': cell.active, 'selected-cell': selectedCell === cell}"
                   style="aspect-ratio: 1; background: #222; cursor: pointer; position: relative; display: flex; justify-content: center; align-items: center;">
                 <span *ngIf="cell.active" style="color: rgba(255,255,255,0.5); font-size: 10px;">{{ cell.x }},{{ cell.y }}</span>
              </div>
            </div>

            <style>
              .active-cell { background: rgba(0, 229, 255, 0.2) !important; }
              .selected-cell { background: rgba(255, 42, 42, 0.4) !important; }
            </style>

            <div *ngIf="selectedCell" style="background: rgba(0,0,0,0.5); border: 1px solid #FF2A2A; padding: 15px; margin-bottom: 10px; display: flex; flex-direction: column; gap: 10px;">
              <h4 style="margin: 0; color: #FF2A2A;">Sector Data: [{{selectedCell.x}}, {{selectedCell.y}}]</h4>
              <div style="display: flex; gap: 10px; align-items: center;">
                <input type="text" [(ngModel)]="selectedCell.name" placeholder="Sector Name" style="background: black; color: white; border: 1px solid gray; padding: 5px; flex: 1;" />
                <input type="text" [(ngModel)]="selectedCell.complication" placeholder="Complication" style="background: black; color: white; border: 1px solid gray; padding: 5px; flex: 1;" />
              </div>
              
              <div style="border-top: 1px dashed gray; padding-top: 10px; margin-top: 5px;">
                <h5 style="margin: 0 0 10px 0; color: #00E5FF;">INDIVIDUAL PUBLISHING (Fog of War)</h5>
                <div *ngFor="let charKey of getCharacterKeys()" style="margin-bottom: 5px;">
                  <label style="color: white; font-size: 14px; display: flex; align-items: center; gap: 10px; cursor: pointer;">
                    <input type="checkbox" 
                      [checked]="selectedCell.revealedTo[charKey]" 
                      (change)="toggleReveal(selectedCell, charKey, $event)" /> 
                    Reveal to: <span class="text-neon-blue">{{ gameState.characters[charKey].name }}</span>
                  </label>
                </div>
              </div>
            </div>

            <div style="display: flex; gap: 10px; margin-top: 10px;">
              <button class="cyber-button" style="border-color: #FF2A2A; color: #FF2A2A; width: 100%;" (click)="publishMap()">PUBLISH MAP TO SQUAD</button>
            </div>
            
            <hr style="border-color: #FF2A2A; opacity: 0.3; margin: 20px 0;" />
            
            <h2 class="text-neon-red">Asset Broadcaster</h2>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              <select [(ngModel)]="selectedAsset" style="background: black; color: white; border: 1px solid #FF2A2A; padding: 5px; flex: 1;">
                <option value="">Select an asset...</option>
                <option *ngFor="let asset of intelAssets" [value]="asset">{{ asset }}</option>
              </select>
              <button class="cyber-button" style="border-color: #FF2A2A; color: #FF2A2A; margin: 0;" (click)="shareAsset(selectedAsset)">BROADCAST INTEL</button>
              <button class="cyber-button" style="border-color: gray; color: white; margin: 0;" (click)="shareAsset(null)">REVOKE INTEL</button>
            </div>
          </div>
          
          <!-- Twitch Chaos Market (Spectator Influence) -->
          <div class="glass-panel" style="flex: 0 0 auto;">
            <h2 class="text-neon-blue">TWITCH CHAOS MARKET</h2>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="color: gray; font-size: 12px;">SPECTATOR INVESTMENT</div>
                <div style="color: #00E5FF; font-size: 24px; font-weight: bold;">$ {{ gameState?.chaosMarketValue || 0 }}</div>
              </div>
              <div *ngIf="isGmMode" style="display: flex; gap: 10px;">
                <button class="cyber-button" style="padding: 5px 15px; margin: 0;" (click)="triggerChaos('lockdown')">BUY LOCKDOWN (1k)</button>
                <button class="cyber-button" style="border-color: #FF2A2A; color: #FF2A2A; padding: 5px 15px; margin: 0;" (click)="triggerChaos('guard')">BUY GUARD (5k)</button>
              </div>
            </div>
          </div>

          <!-- GM Dashboard Controls -->
          <div *ngIf="isGmMode" class="glass-panel gm-panel" style="flex: 0 0 auto;">
            <h2 class="text-neon-red">GM System Controls</h2>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <label style="color: gray; font-size: 12px; display: block;">GLOBAL HEAT LEVEL</label>
                <div style="display: flex; align-items: center; gap: 10px; margin-top: 5px;">
                  <button class="cyber-button" style="padding: 5px 15px; margin: 0;" (click)="updateHeat(-1)">-</button>
                  <span style="font-size: 24px; color: #FF2A2A; font-weight: bold;">{{ gameState?.heatLevel || 1 }}</span>
                  <button class="cyber-button" style="padding: 5px 15px; margin: 0;" (click)="updateHeat(1)">+</button>
                </div>
              </div>
              <div>
                <label style="color: gray; font-size: 12px; display: block;">DEBT LEDGER</label>
                <div style="color: #00E5FF; font-size: 20px;">$ {{ gameState?.debtLedger || 50000 }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Squad, Trauma & Rolls -->
        <div style="display: flex; flex-direction: column; gap: 20px; overflow-y: auto;">
          
          <!-- Squad Status -->
          <div class="glass-panel" style="flex: 2; overflow-y: auto;">
            <h2 class="text-neon-blue">Squad Status</h2>
            <div *ngIf="!gameState?.characters || getCharacterKeys().length === 0" style="color: gray;">No operators online.</div>
            <div *ngFor="let key of getCharacterKeys()" style="margin-bottom: 25px; padding: 15px; background: rgba(0,0,0,0.4); border: 1px solid rgba(0,229,255,0.2);">
              <strong class="text-neon-blue" style="font-size: 18px;">{{ gameState.characters[key].name }}</strong>
              <div style="font-size: 12px; color: gray; margin-bottom: 10px;">{{ gameState.characters[key].role }}</div>
              
              <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                <span>HP</span>
                <span class="text-neon-blue">{{ gameState.characters[key].hp }} / 100</span>
              </div>
              <div style="background: #333; height: 8px; border-radius: 4px; margin-bottom: 10px;">
                <div [style.width.%]="gameState.characters[key].hp" style="background: #00E5FF; height: 100%; border-radius: 4px; box-shadow: 0 0 10px #00E5FF;"></div>
              </div>

              <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                <span>ALLOSTATIC STRESS</span>
                <span class="text-neon-red">{{ gameState.characters[key].stress || 0 }} / 100</span>
              </div>
              <div style="background: #333; height: 8px; border-radius: 4px; margin-bottom: 10px;">
                <div [style.width.%]="gameState.characters[key].stress || 0" style="background: #FF2A2A; height: 100%; border-radius: 4px; opacity: 0.7;"></div>
              </div>
              
              <div *ngIf="gameState.characters[key].stress > 75" style="color: #FF2A2A; font-weight: bold; font-size: 10px; animation: blink 1s infinite;">
                WARNING: CYBERPSYCHOSIS IMMINENT
              </div>
            </div>
          </div>

          <!-- Zero Sum Trauma Log -->
          <div class="glass-panel" style="flex: 1; overflow-y: auto; border-color: #FF2A2A;">
            <h2 class="text-neon-red">Zero-Sum Transfer Log</h2>
            <div style="font-size: 10px; color: gray; margin-bottom: 10px;">To heal, another must bleed.</div>
            <div *ngIf="!gameState?.traumaLog || getTraumaKeys().length === 0" style="color: gray;">No collateral damage yet.</div>
            <div *ngFor="let key of getTraumaKeys()" style="padding: 10px; border-left: 2px solid #FF2A2A; margin-bottom: 5px; background: rgba(255,42,42,0.1);">
              <div style="font-size: 10px; color: gray;">{{ gameState.traumaLog[key].timestamp | date:'shortTime' }}</div>
              <strong style="color: white;">{{ gameState.traumaLog[key].player }} HEALED +{{ gameState.traumaLog[key].amount }}</strong>
              <div style="color: #FF2A2A; font-size: 12px; margin-top: 4px;">
                CIVILIAN CASUALTY: <strong>{{ gameState.traumaLog[key].civilian }}</strong> (Life Support Rerouted)
              </div>
            </div>
          </div>
          
          <!-- Live Rolls -->
          <div class="glass-panel" style="flex: 1; overflow-y: auto;">
            <h2 class="text-neon-blue">Live Dice Rolls</h2>
            <div *ngIf="gameState?.recentRolls?.length === 0" style="color: gray;">No rolls yet.</div>
            <div *ngFor="let roll of gameState?.recentRolls" style="padding: 10px; border-bottom: 1px solid rgba(0,229,255,0.2);">
              <strong>{{ roll.player }}</strong> rolled a 
              <span class="text-neon-red" style="font-size: 1.5em; font-weight: bold;">{{ roll.result }}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  `
})
export class AppComponent implements OnInit {
  gameState: any = { recentRolls: [], characters: {}, map: null, heatLevel: 1, debtLedger: 50000, sharedAsset: null, chaosMarketValue: 0, traumaLog: {} };
  sessionId: string | null = null;
  isGmMode: boolean = false;
  inputPin: string = '';
  private db: any;

  intelAssets = [
    'ashburn_data_center_redacted.jpg',
    'auditor_redacted.jpg',
    'black_market_kiosk_redacted.jpg',
    'climate_disaster_zone_redacted.jpg',
    'corporate_debt_notice_redacted.jpg',
    'dark_money_syndicate_redacted.jpg',
    'zero_day_exploit_redacted.jpg'
  ];
  
  selectedAsset: string = '';
  builderMapArchetype: string = 'Custom Facility';
  
  gridSize = 8;
  gridCells: any[] = [];
  selectedCell: any = null;

  ngOnInit() {
    this.initGrid();
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const session = params.get('session');
      const mode = params.get('mode');
      
      if (session) {
        this.sessionId = session;
        this.isGmMode = mode === 'gm';
        this.connectFirebase();
      }
    }
  }

  initGrid() {
    this.gridCells = [];
    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        this.gridCells.push({ x, y, active: false, name: '', complication: 'Clear', revealedTo: {} });
      }
    }
  }

  getCell(x: number, y: number) {
    return this.gridCells.find(c => c.x === x && c.y === y);
  }

  toggleCell(cell: any) {
    cell.active = !cell.active;
    if (cell.active) {
      this.selectedCell = cell;
    } else if (this.selectedCell === cell) {
      this.selectedCell = null;
    }
  }
  
  selectCell(cell: any, event: Event) {
    event.preventDefault(); // prevent context menu
    event.stopPropagation();
    if (cell.active) {
      this.selectedCell = cell;
    }
  }

  toggleReveal(cell: any, charKey: string, event: any) {
    cell.revealedTo[charKey] = event.target.checked;
  }

  getBorders(cell: any) {
    if (!cell.active) return {};
    const n = this.getCell(cell.x, cell.y - 1)?.active;
    const s = this.getCell(cell.x, cell.y + 1)?.active;
    const e = this.getCell(cell.x + 1, cell.y)?.active;
    const w = this.getCell(cell.x - 1, cell.y)?.active;
    
    return {
      'border-top': !n ? '2px solid #00E5FF' : 'none',
      'border-bottom': !s ? '2px solid #00E5FF' : 'none',
      'border-left': !w ? '2px solid #00E5FF' : 'none',
      'border-right': !e ? '2px solid #00E5FF' : 'none',
    };
  }

  getSpectatorGrid() {
    let grid = [];
    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        let room = this.gameState?.map?.rooms?.find((r:any) => r.x === x && r.y === y);
        if (room) {
          grid.push({ ...room, active: true });
        } else {
          grid.push({ x, y, active: false });
        }
      }
    }
    return grid;
  }

  getSpectatorBorders(cell: any) {
    if (!cell.active) return {};
    const rooms = this.gameState?.map?.rooms || [];
    const n = rooms.find((r:any) => r.x === cell.x && r.y === cell.y - 1);
    const s = rooms.find((r:any) => r.x === cell.x && r.y === cell.y + 1);
    const e = rooms.find((r:any) => r.x === cell.x + 1 && r.y === cell.y);
    const w = rooms.find((r:any) => r.x === cell.x - 1 && r.y === cell.y);
    
    return {
      'border-top': !n ? '2px solid #00E5FF' : 'none',
      'border-bottom': !s ? '2px solid #00E5FF' : 'none',
      'border-left': !w ? '2px solid #00E5FF' : 'none',
      'border-right': !e ? '2px solid #00E5FF' : 'none',
      'background': 'rgba(0, 229, 255, 0.2)'
    };
  }

  onPinInput(event: any) {
    this.inputPin = event.target.value;
  }

  joinSession(mode: string) {
    if (this.inputPin.length >= 4) {
      window.location.href = `/?session=${this.inputPin}&mode=${mode}`;
    }
  }

  connectFirebase() {
    const app = initializeApp(firebaseConfig);
    this.db = getDatabase(app);
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      connectDatabaseEmulator(this.db, 'localhost', 9000);
    }
    const stateRef = ref(this.db, `sessions/${this.sessionId}/gameState`);
    onValue(stateRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        this.gameState = { ...this.gameState, ...data };
        
        // Populate builder if GM
        if (this.isGmMode && data.map && this.gridCells.every(c => !c.active)) {
            this.builderMapArchetype = data.map.archetype;
            const rooms = data.map.rooms || [];
            rooms.forEach((r: any) => {
              const cell = this.getCell(r.x, r.y);
              if (cell) {
                cell.active = true;
                cell.name = r.name;
                cell.complication = r.complication;
                cell.revealedTo = r.revealedTo || {};
              }
            });
        }
      }
    });
  }

  updateHeat(delta: number) {
    if (!this.db || !this.sessionId) return;
    const newHeat = Math.max(1, Math.min(10, (this.gameState.heatLevel || 1) + delta));
    const heatRef = ref(this.db, `sessions/${this.sessionId}/gameState/heatLevel`);
    set(heatRef, newHeat);
  }

  getCharacterKeys() {
    return this.gameState && this.gameState.characters ? Object.keys(this.gameState.characters) : [];
  }
  
  getTraumaKeys() {
    return this.gameState && this.gameState.traumaLog ? Object.keys(this.gameState.traumaLog) : [];
  }

  publishMap() {
    if (!this.db || !this.sessionId) return;
    const mapRef = ref(this.db, `sessions/${this.sessionId}/gameState/map`);
    const activeRooms = this.gridCells.filter(c => c.active).map(c => ({
      x: c.x,
      y: c.y,
      name: c.name,
      complication: c.complication,
      revealedTo: c.revealedTo
    }));
    set(mapRef, {
      archetype: this.builderMapArchetype,
      layoutStructure: 'Grid-Based Modular',
      rooms: activeRooms
    });
  }

  shareAsset(filename: string | null) {
    if (!this.db || !this.sessionId) return;
    const assetRef = ref(this.db, `sessions/${this.sessionId}/gameState/sharedAsset`);
    if (filename) {
        set(assetRef, `https://zero-sum-rpg-2026.web.app/assets/intel/${filename}`);
    } else {
        set(assetRef, null);
    }
  }

  triggerChaos(type: string) {
    if (!this.db || !this.sessionId) return;
    let cost = type === 'lockdown' ? 1000 : 5000;
    const currentMarket = this.gameState?.chaosMarketValue || 0;
    const marketRef = ref(this.db, `sessions/${this.sessionId}/gameState/chaosMarketValue`);
    set(marketRef, currentMarket + cost);
  }
}
