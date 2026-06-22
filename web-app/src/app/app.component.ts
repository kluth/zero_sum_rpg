import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, connectDatabaseEmulator } from 'firebase/database';

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
  imports: [CommonModule],
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

      <div class="dashboard-grid">
        <!-- Live Rolls -->
        <div class="glass-panel" style="overflow-y: auto;">
          <h2 class="text-neon-blue">Live Dice Rolls</h2>
          <div *ngIf="gameState?.recentRolls?.length === 0" style="color: gray;">No rolls yet.</div>
          <div *ngFor="let roll of gameState?.recentRolls" style="padding: 10px; border-bottom: 1px solid rgba(0,229,255,0.2);">
            <strong>{{ roll.player }}</strong> rolled a 
            <span class="text-neon-red" style="font-size: 1.5em; font-weight: bold;">{{ roll.result }}</span>
          </div>
        </div>

        <!-- Center Column: Map & GM Controls -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <!-- Tactical Map -->
          <div class="glass-panel" style="flex: 1;">
            <h2 class="text-neon-blue">Tactical Map</h2>
            <div *ngIf="!gameState?.map" style="color: gray;">Awaiting Intel...</div>
            <div *ngIf="gameState?.map">
              <h3 class="text-neon-red" style="margin-bottom: 5px;">{{ gameState.map.archetype }}</h3>
              <p style="color: gray; margin-top: 0;">Layout: {{ gameState.map.layoutStructure }}</p>
              
              <div *ngFor="let room of gameState.map.rooms" style="margin-top: 10px; padding: 10px; background: rgba(0,0,0,0.3); border-left: 3px solid #00E5FF;">
                <span [ngStyle]="{'color': room.isObjective ? '#FF2A2A' : '#00E5FF', 'font-weight': 'bold', 'margin-right': '10px'}">
                  [0{{ room.id }}]
                </span>
                <strong>{{ room.name }}</strong>
                <div *ngIf="room.complication !== 'Clear'" style="color: #FF2A2A; font-size: 0.8em; margin-top: 5px;">
                  WARN: {{ room.complication }}
                </div>
              </div>
            </div>
          </div>

          <!-- GM Dashboard Controls -->
          <div *ngIf="isGmMode" class="glass-panel gm-panel" style="flex: 0 0 auto;">
            <h2 class="text-neon-red">GM Controls</h2>
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

        <!-- Squad Status -->
        <div class="glass-panel" style="overflow-y: auto;">
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
              <span>STEALTH</span>
              <span class="text-neon-blue">{{ gameState.characters[key].stealth }} / 100</span>
            </div>
            <div style="background: #333; height: 8px; border-radius: 4px;">
              <div [style.width.%]="gameState.characters[key].stealth" style="background: #00E5FF; height: 100%; border-radius: 4px; opacity: 0.7;"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AppComponent implements OnInit {
  gameState: any = { recentRolls: [], characters: {}, map: null, heatLevel: 1, debtLedger: 50000 };
  sessionId: string | null = null;
  isGmMode: boolean = false;
  inputPin: string = '';
  private db: any;

  ngOnInit() {
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
}
