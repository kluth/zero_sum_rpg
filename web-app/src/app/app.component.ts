import { Component, OnInit, OnDestroy, signal, computed, effect, inject, Injector, ChangeDetectionStrategy } from '@angular/core';
import { interval } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GridStore, RoomData } from './grid.store';
import { executeEmergencyHeal, EmergencyHealCommand } from '@core-domain/ledger/EmergencyHeal';
import { PlayerCharacter, CivilianEntity } from '@core-domain/ledger/Entities';
import { ActionQueueService } from './core/services/ActionQueueService';
import { WebRTCService } from './core/services/webrtc.service';
import { AIEngineService } from './core/services/ai-engine.service';
import { FacilityGeneratorService } from './core/services/facility-generator.service';
import { UiStateService } from './services/ui-state.service';

let fbApp: any;
let fbDb: any;
let getDb: any;
let fbRef: any;
let fbSet: any;
let fbOnValue: any;
let fbOnChildAdded: any;
let fbRemove: any;

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
  imports: [
    CommonModule, FormsModule, RouterModule
  ],
  styleUrls: ['./app.component.scss'],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit, OnDestroy {
  // Simulated clock for the OS
  time$ = interval(1000).pipe(map(() => new Date()));
  
  // Cognitive Load metric for Zero-Sum display
  usedCapacity = 120; // Simulated high load for UI testing

  private webrtc = inject(WebRTCService);
  public aiEngine = inject(AIEngineService);
  private injector = inject(Injector);
  private facilityGenerator = inject(FacilityGeneratorService);
  public uiState = inject(UiStateService);
  gameState = signal<any>({ characters: {}, map: null, traumaLog: {}, clocks: {}, flashbacks: {} });
  heatLevel = computed(() => this.gameState().heatLevel || 1);
  chaosMarketValue = computed(() => this.gameState()?.chaosMarketValue || 0);

  squadHpAvg = computed(() => {
    const chars = this.gameState()?.characters || {};
    const keys = Object.keys(chars);
    if (keys.length === 0) return 100;
    const total = keys.reduce((acc, key) => acc + (chars[key].stats?.hp_current || 0), 0);
    return Math.floor(total / keys.length);
  });

  myCharStats = computed(() => {
    const chars = this.gameState()?.characters || {};
    const me = this.activePlayerId();
    if (me && chars[me]) return chars[me].stats;
    return null;
  });

  squadStressAvg = computed(() => {
    const chars = this.gameState()?.characters || {};
    const keys = Object.keys(chars);
    if (keys.length === 0) return 0;
    const total = keys.reduce((acc, key) => acc + (chars[key].stats?.stress_current || 0), 0);
    return Math.floor(total / keys.length);
  });
  
  traumaCount = computed(() => {
    return Object.keys(this.gameState()?.traumaLog || {}).length;
  });

  tmiClient: any = null;
  
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
  
  sessionPinInput = signal<string>('');
  twitchChannelInput = signal<string>('');
  
  private router = inject(Router);
  isLoading = signal<boolean>(false);
  isStabilized = computed(() => this.uiState.isStabilized());

  sessionId = signal<string | null>(null);
  mode = signal<string | null>(null);
  activePlayerId = signal<string | null>(null);
  showWebcamPanel = signal<boolean>(false);
  show3d = signal<boolean>(false);
  
  isGmMode = computed(() => this.mode() === 'gm');
  isBillboardMode = computed(() => this.mode() === 'billboard');
  isSupportMode = computed(() => this.mode() === 'support');
  is3dMode = computed(() => this.mode() === '3d');
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

  private db: any;
  private app: any;
  
  builderMapArchetype = 'Custom Facility';
  terminalCommand = '';
  terminalLogs = signal<string[]>(['System Ready. Declarative Web MCP initialized.', 'Local LLM ICE loaded.', 'Awaiting command...']);
  currentLevel = signal<number>(1);
  
  recentTrauma = signal<any>(null);
  directorFocus = signal<{charId: string, reason: string} | null>(null);

  squadVitalsKeys = computed(() => {
     const chars = this.gameState()?.characters || {};
     return Object.keys(chars).filter(k => k.startsWith('p'));
  });

  visibleCams = computed(() => {
     const chars = this.gameState()?.characters || {};
     let players = Object.keys(chars).filter(k => k.startsWith('p')).slice(0, 4);
     while (players.length < 4) {
         players.push(`cam_offline_${players.length}`);
     }
     return players;
  });

  // Architect Store and UI State
  gridStore = inject(GridStore);
  actionQueue = inject(ActionQueueService);
  activeTab = signal<'blocks' | 'paint' | 'properties'>('blocks');
  activePrefab = signal<string>('corridor');
  activePaintMode = signal<string | null>(null);
  selectedRoomId = signal<string | null>(null);
  selectedCell = signal<{x: number, y: number} | null>(null);
  blockPoolUsed = computed(() => Object.keys(this.gridStore.grid() || {}).length);
  wfcError = signal<string | null>(null);

  constructor() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        let stabilized = false;
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            stabilized = localStorage.getItem('zero_sum_stabilized') === 'true';
          }
        } catch (e) {
          console.error('Error reading zero_sum_stabilized from localStorage:', e);
        }
        this.uiState.setStabilized(stabilized);
        this.isLoading.set(true);
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        setTimeout(() => {
          this.isLoading.set(false);
        }, 500);
      }
    });

    const urlParams = new URLSearchParams(window.location.search);
    const pinParam = urlParams.get('pin');
    if (pinParam) {
       this.sessionId.set(pinParam.replace(/[\.#\$\[\]\/]/g, '_'));
    }

    // IoT Web Audio API Siren Effect
    effect(() => {
      const heat = this.heatLevel();
      if (heat >= 8 && this.isBillboardMode()) {
         this.playSiren();
      }
    });
    
    // Procedural Guilt & Director Automation
    let lastTraumaKey: string | null = null;
    effect(() => {
       const state = this.gameState();
       if (state.traumaLog) {
         const keys = Object.keys(state.traumaLog);
         if (keys.length > 0) {
           const latestKey = keys[keys.length - 1];
           if (lastTraumaKey !== latestKey) {
             lastTraumaKey = latestKey;
             const latest = state.traumaLog[latestKey];
             this.recentTrauma.set(latest);
             
             // Director Automation: Focus on the character involved
             if (latest.civilian) {
                 const charId = Object.keys(state.characters || {}).find(k => state.characters[k].name === latest.civilian) || latest.civilian;
                 this.directorFocus.set({ charId, reason: latest.action || 'TRAUMA_EVENT' });
                 setTimeout(() => {
                     // Clear focus if it hasn't changed
                     if (this.directorFocus()?.charId === charId) this.directorFocus.set(null);
                 }, 6000);
             }
             
             setTimeout(() => {
                 if (this.recentTrauma() === latest) this.recentTrauma.set(null);
             }, 10000);
           }
         }
       }
    }, { allowSignalWrites: true });
  }

  async ngOnInit() {
    if (typeof window !== 'undefined') {
      fbApp = await import('firebase/app');
      fbDb = await import('firebase/database');
      
      this.app = fbApp.initializeApp(firebaseConfig);
      this.db = fbDb.getDatabase(this.app);
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        try {
          fbDb.connectDatabaseEmulator(this.db, 'localhost', 9000);
        } catch (e) {
          // Suppress duplicate connection errors
        }
      }

      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      
      let session = this.sessionId() || params.get('session');
      let m = params.get('mode');
      let player = params.get('player');
      
      if (token) {
        try {
          const decoded = JSON.parse(atob(token));
          session = decoded.s;
          m = decoded.m;
          player = decoded.p;
        } catch(e) {
          console.error('Invalid token');
        }
      }
      
      if (session) {
        this.sessionId.set(session.replace(/[\.#\$\[\]\/]/g, '_'));
        this.mode.set(m);
        if (player) this.activePlayerId.set(player);
        this.connectFirebase();
      }
    }
  }

  ngOnDestroy() {
     
  }

  // --- PixiJS & WFC Builder Methods ---
  
  onCanvasCellClicked(pos: {x: number, y: number}) {
    // Unlimited blocks as requested
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
         this.updateCell(pos.x + dx, pos.y + dy, { type: 'structure_wall', roomId: roomId });
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

  generateProceduralFacility() {
    this.wfcError.set("INITIALIZING PROCEDURAL GENERATION...");
    const currentZ = this.currentLevel();
    const resultMsg = this.facilityGenerator.generateProceduralFacility(currentZ);
    this.wfcError.set(resultMsg);
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

  getRoomHeight() {
    const roomId = this.selectedRoomId();
    return roomId ? this.gridStore.rooms()[roomId]?.metadata?.zHeight || 1 : 1;
  }
  updateRoomHeight(zHeight: number) {
    const roomId = this.selectedRoomId();
    if (roomId) {
       const room = this.gridStore.rooms()[roomId];
       const updatedRoom = { ...room, metadata: { ...room.metadata, zHeight: Number(zHeight) } };
       this.gridStore.updateRoom(roomId, updatedRoom);
    }
  }

  applyRoomTemplate(templateName: string) {
    const roomId = this.selectedRoomId();
    if (!roomId) return;
    this.facilityGenerator.applyRoomTemplate(roomId, templateName, this.currentLevel());
  }
  setTab(tab: 'blocks' | 'paint' | 'properties') {
    this.activeTab.set(tab);
    if (tab === 'paint') {
      this.activePaintMode.set('wall');
    } else {
      this.activePaintMode.set(null);
    }
  }

  updateCell(x: number, y: number, cellData: any) {
    this.gridStore.updateCell(x, y, this.currentLevel(), cellData);
  }

  onCellPainted(event: {x: number, y: number, type: string}) {
    if (event.type === 'floor') {
      // Treat 'floor' as eraser
      this.updateCell(event.x, event.y, { type: 'empty' } as any);
    } else {
      this.updateCell(event.x, event.y, { type: event.type } as any);
    }
  }


  getCharacterKeys() {
    return this.gameState() && this.gameState().characters ? Object.keys(this.gameState().characters) : [];
  }

  joinSession(mode: string, playerId?: string) {
    const pin = this.sessionPinInput().toUpperCase();
    if (!pin || pin.length < 4) return;
    
    const payload: any = { s: pin, m: mode };
    if (playerId) payload.p = playerId;
    
    const encoded = btoa(JSON.stringify(payload));
    const url = `/?token=${encoded}`;
    
    if (mode === 'gm' && this.twitchChannelInput()) {
      const dbRef = fbDb.ref(this.db, `sessions/${pin}/gameState/twitchChannel`);
      fbDb.set(dbRef, this.twitchChannelInput().toLowerCase()).then(() => {
         window.location.href = url;
      });
    } else {
      window.location.href = url;
    }
  }

  deploySquad() {
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
                hp_current: 100,
                hp_max: 100,
                stealth_base: 50,
                stealth_total: 50,
                stress_current: 0,
                stress_max: 100,
                snr_threshold_base: 10,
                snr_threshold_total: 10
            },
            active_conditions: [],
            modifiers: []
         };
      });
      fbDb.set(fbDb.ref(this.db, `sessions/${this.sessionId()}/gameState/characters`), chars);
  }

  dealDamageToSquad() {
     if (!this.db || !this.sessionId()) return;
     const chars = this.gameState().characters || {};
     const updated = { ...chars };
     Object.keys(updated).forEach(key => {
        if (!updated[key].stats) return;
        updated[key].stats.hp_current = Math.max(0, updated[key].stats.hp_current - 20);
     });
     fbDb.set(fbDb.ref(this.db, `sessions/${this.sessionId()}/gameState/characters`), updated);
  }

  inflictStressToSquad() {
     if (!this.db || !this.sessionId()) return;
     const chars = this.gameState().characters || {};
     const updated = { ...chars };
     Object.keys(updated).forEach(key => {
        if (!updated[key].stats) return;
        updated[key].stats.stress_current = Math.min(100, updated[key].stats.stress_current + 20);
     });
     fbDb.set(fbDb.ref(this.db, `sessions/${this.sessionId()}/gameState/characters`), updated);
  }

  spawnTraumaEvent() {
     if (!this.db || !this.sessionId()) return;
     const eventId = `evt_${Date.now()}`;
     const names = ["Corporate Guard", "Maintenance Tech 44", "Bystander", "Data Courier", "Unknown Civilian"];
     const logEntry = {
        timestamp: Date.now(),
        civilian: names[Math.floor(Math.random() * names.length)],
        severity: "FATAL"
     };
     fbDb.set(fbDb.ref(this.db, `sessions/${this.sessionId()}/gameState/traumaLog/${eventId}`), logEntry);
     this.updateHeat(1);
  }

  async triggerAiGmEvent() {
      const state = this.gameState();
      const recent = state.recentRolls ? state.recentRolls.map((r: any) => r.type) : [];
      const eventText = await this.aiEngine.generateGmEvent(this.heatLevel(), recent);
      
      const eventId = `ai_evt_${Date.now()}`;
      const logEntry = {
         timestamp: Date.now(),
         civilian: "AI OVERLORD",
         severity: "THREAT",
         message: eventText
      };
      
      if (this.db && this.sessionId()) {
         fbDb.set(fbDb.ref(this.db, `sessions/${this.sessionId()}/gameState/traumaLog/${eventId}`), logEntry);
      }
      console.log("[AI GM Event]", eventText);
  }

  isGm() { return this.isGmMode(); }

  addTraumaLog(sender: string, level: string, msg: string) {
     if (!this.db || !this.sessionId()) return;
     fbDb.push(fbDb.ref(this.db, `sessions/${this.sessionId()}/gameState/traumaLog`), {
        timestamp: Date.now(),
        civilian: sender,
        severity: level,
        message: msg
     });
  }

  processBotAction(action: any) {
    if (!action || !action.type || !action.playerId) return;
    const pId = action.playerId;
    const type = action.type;
    
    // Ensure character exists
    let state = this.gameState();
    if (!state.characters || !state.characters[pId]) {
       const newChar = { x: 5, y: 5, hp: 10, maxHp: 10, ap: 3, role: 'Bot', status: 'online' };
       if(this.db && this.sessionId()) {
         fbSet(fbRef(this.db, `sessions/${this.sessionId()}/gameState/characters/${pId}`), newChar);
       }
    }

    if (type === 'MOVE') {
      const char = this.gameState().characters?.[pId];
      if (char) {
        fbSet(fbRef(this.db, `sessions/${this.sessionId()}/gameState/characters/${pId}/x`), char.x + (action.dx || 0));
        fbSet(fbRef(this.db, `sessions/${this.sessionId()}/gameState/characters/${pId}/y`), char.y + (action.dy || 0));
        this.addTraumaLog("SYSTEM", "INFO", `Bot ${pId} moved.`);
      }
    } else if (type === 'ACTION') {
      this.updateHeat(1);
      this.addTraumaLog(pId, "INFO", `Bot performed: ${action.payload}`);
    }
  }

  connectFirebase() {
    const sessionPin = this.sessionId();
    const playerId = this.activePlayerId() || 'spectator_' + Date.now();
    
    if (sessionPin) {
      // Setup CURL API Queue listener for headless agent networks
      if (this.isGm()) {
        fbOnChildAdded(fbRef(this.db, `sessions/${this.sessionId()}/apiQueue`), (snapshot: any) => {
          const action = snapshot.val();
          if (action) {
            console.log("[API Queue] Processing CURL action:", action);
            this.processBotAction(action);
            fbRemove(snapshot.ref);
          }
        });
      }

       this.webrtc.initialize(sessionPin, playerId, this.isGmMode()).catch(e => console.error("WebRTC Error:", e));
       
       effect(() => {
          const msg = this.webrtc.incomingMessages();
          if (!msg) return;
          
          if (this.isGmMode() && msg.payload.type === 'MOVE') {
             const pid = msg.senderId;
             const pos = msg.payload.data;
             const currentState = this.gameState();
             if (currentState.characters && currentState.characters[pid]) {
                 currentState.characters[pid].x = pos.x;
                 currentState.characters[pid].y = pos.y;
                 
                 // Persist to Firebase directly (bypassing slow ActionQueue)
                 fbDb.set(fbDb.ref(this.db, `sessions/${sessionPin}/gameState/characters/${pid}`), currentState.characters[pid]);
                 
                 // Broadcast to other P2P nodes for sub-10ms sync
                 this.webrtc.broadcastToPlayers({ type: 'STATE_UPDATE', data: { pid, x: pos.x, y: pos.y } });
             }
          } else if (!this.isGmMode() && msg.payload.type === 'STATE_UPDATE') {
             // Client instantly applying P2P state
             const update = msg.payload.data;
             const currentState = this.gameState();
             if (currentState.characters && currentState.characters[update.pid]) {
                 currentState.characters[update.pid].x = update.x;
                 currentState.characters[update.pid].y = update.y;
                 this.gameState.set({ ...currentState });
             }
          }
       }, { injector: this.injector });
    }

    const stateRef = fbDb.ref(this.db, `sessions/${this.sessionId()}/gameState`);
    fbDb.onValue(stateRef, (snapshot: any) => {
      const data = snapshot.val();
      if (data) {
        if (this.isGmMode() && data.twitchChannel && !this.tmiClient) {
          this.initTmiClient(data.twitchChannel);
        }
        
        // --- Action Queue Processor (GM only) ---
        if (this.isGmMode()) {
           const queueRef = fbDb.ref(this.db, `sessions/${this.sessionId()}/actionQueue`);
           fbDb.onValue(queueRef, (qSnapshot: any) => {
              const queueData = qSnapshot.val();
              if (queueData) {
                 this.processActionQueue(queueData);
              }
           });
        }
        // ----------------------------------------
        
        data.characters = data.characters || {};
        data.traumaLog = data.traumaLog || {};
        
          data.recentRolls = data.recentRolls ? Object.values(data.recentRolls) : [];
          this.gameState.update(s => ({ ...data, clocks: s?.clocks || {}, flashbacks: s?.flashbacks || {} }));

        
        if (data.map) {
           this.gridStore.setState({
             grid: data.map.grid || {},
             rooms: data.map.rooms || {},
             dimensions: data.map.dimensions || { width: 50, height: 30 }
           });
        }
      }
    });

    const clocksRef = fbDb.ref(this.db, `sessions/${this.sessionId()}/clocks`);
    fbDb.onValue(clocksRef, (snapshot: any) => {
      this.gameState.update(s => ({ ...s, clocks: snapshot.val() || {} }));
    });

    const flashbacksRef = fbDb.ref(this.db, `sessions/${this.sessionId()}/flashbacks`);
    fbDb.onValue(flashbacksRef, (snapshot: any) => {
      this.gameState.update(s => ({ ...s, flashbacks: snapshot.val() || {} }));
    });
  }

  updateHeat(delta: number) {
    if (!this.db || !this.sessionId()) return;
    const newHeat = Math.max(1, Math.min(10, this.heatLevel() + delta));
    fbDb.set(fbDb.ref(this.db, `sessions/${this.sessionId()}/gameState/heatLevel`), newHeat);
  }

  getTraumaLog(): any[] {
    const state = this.gameState();
    return state.traumaLog ? Object.values(state.traumaLog) : [];
  }

  traumaLogArray = computed(() => {
    return this.getTraumaLog().sort((a: any, b: any) => b.timestamp - a.timestamp);
  });

  publishMap() {
    if (!this.db || !this.sessionId()) return;
    fbDb.set(fbDb.ref(this.db, `sessions/${this.sessionId()}/gameState/map`), {
      dimensions: this.gridStore.dimensions(),
      grid: this.gridStore.grid(),
      rooms: this.gridStore.rooms()
    });
  }

  executeIceCommand() {
     const cmd = this.terminalCommand.toLowerCase().trim();
     this.terminalLogs.update(logs => [...logs, cmd]);
     this.terminalCommand = '';
     
     // Local Netrunner ICE processor
     if (cmd === 'help') {
        this.terminalLogs.update(logs => [
           ...logs, 
           'LOCAL TERMINAL V2.4', 
           '  help     - Display all available commands', 
           '  grep     - Search and extract metadata', 
           '  overload - Bypass grid regulators (Crash chaos market)'
        ]);
     } else if (cmd.startsWith('overload')) {
        this.terminalLogs.update(logs => [...logs, '>>> INTRUSION SUCCESS: GRID OVERLOADED.', '>>> CHAOS MARKET FORCED TO 0.']);
        if (this.db && this.sessionId()) {
          fbDb.set(fbDb.ref(this.db, `sessions/${this.sessionId()}/gameState/chaosMarketValue`), 0);
        }
     } else if (cmd.startsWith('grep')) {
        const query = cmd.replace('grep', '').trim();
        if (query) {
           this.terminalLogs.update(logs => [...logs, `>>> EXTRACTING "${query}"...`, `[DATA] Found encrypted signatures matching "${query}".`]);
        } else {
           this.terminalLogs.update(logs => [...logs, 'ERR: grep requires a target argument.']);
        }
     } else {
        this.terminalLogs.update(logs => [...logs, `ERR: Command '${cmd}' not recognized.`]);
     }
  }

  async initTmiClient(channel: string) {
    const tmi = await import('tmi.js');
    this.tmiClient = new tmi.Client({
      connection: { secure: true, reconnect: true },
      channels: [ channel ]
    });

    this.tmiClient.connect().catch(console.error);

    this.tmiClient.on('message', (channelName: string, tags: any, message: string, self: boolean) => {
      if (self) return;
      const msg = message.toLowerCase();
      if (msg.includes('!chaos')) {
        this.injectChaosFromTwitch(10);
      }
    });

    this.tmiClient.on('cheer', (channelName: string, userstate: any, message: string) => {
      const bits = parseInt(userstate.bits, 10);
      if (bits > 0) {
        this.injectChaosFromTwitch(Math.max(10, Math.floor(bits / 10)));
      }
    });
  }

  async injectChaosFromTwitch(amount: number) {
    if (!this.sessionId()) return;
    const { getDatabase, ref, set, onValue, onChildAdded, remove, increment } = await import('firebase/database');
    getDb = getDatabase;
    fbRef = ref;
    fbSet = set;
    fbOnValue = onValue;
    fbOnChildAdded = onChildAdded;
    fbRemove = remove;
    set(ref(fbDb.getDatabase(), `sessions/${this.sessionId()}/gameState/chaosMarketValue`), increment(amount));
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

    // Execute Pure Domain Logic (Simulation for validation)
    const result = executeEmergencyHeal(command);

    if (result.isSuccess()) {
      const successData = result.value;
      
      // Dispatch securely to the ActionQueue instead of directly modifying gameState
      this.actionQueue.dispatchAction(this.sessionId()!, this.activePlayerId()!, 'EMERGENCY_HEAL', {
          targetId: this.activePlayerId()!,
          hpRestored: successData.actualHpRestored,
          apCost: 2
      }).then(() => {
         console.log(`HEAL DISPATCHED. ${successData.actualHpRestored} HP requested.`);
      });
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
         this.terminalLogs.update(logs => [...logs, 'SYSTEM: Physical BLE Hardware missing on this terminal. Physical validation impossible.']);
         return;
     }
     try {
         this.terminalLogs.update(logs => [...logs, 'SYSTEM: Scanning physical playing room for Bluetooth Low Energy beacons...']);
         const device = await (window.navigator as any).bluetooth.requestDevice({
             acceptAllDevices: true,
             optionalServices: ['battery_service']
         });
         this.terminalLogs.update(logs => [...logs, `SYSTEM: Connected to ${device.name}. Proximity verified. Mainframe access granted.`]);
     } catch (error: any) {
         this.terminalLogs.update(logs => [...logs, `SYSTEM: Air-gap connection failed. ${error.message}`]);
     }
  }
  
  
  onPlayerMoved(pos: {x: number, y: number}) {
    const pid = this.activePlayerId();
    if (!pid || !this.sessionId()) return;
    
    // Route movement strictly over P2P WebRTC to bypass the slow Firebase ActionQueue
    this.webrtc.sendToGm({ type: 'MOVE', data: { x: pos.x, y: pos.y, apCost: 1 } });
    
    // Optimistically update local state for 0ms latency perception
    const state = this.gameState();
    if (state.characters && state.characters[pid]) {
        state.characters[pid].x = pos.x;
        state.characters[pid].y = pos.y;
        this.gameState.set({ ...state });
    }
  }
  
  processActionQueue(queueData: any) {
    if (!this.db || !this.sessionId()) return;
    
    // Simulate Backend Processing (Resolution Engine)
    const actions = Object.entries(queueData);
    let stateMutated = false;
    const currentState = this.gameState() || { characters: {} };
    
    actions.forEach(([key, action]: [string, any]) => {
        let rollResult = `Executed action: ${action.type.toUpperCase()}`;
        const pid = action.playerId;
        
        // Actually resolve the actions
        if (action.type === 'MOVE' && action.payload) {
             if (currentState.characters[pid]) {
                 currentState.characters[pid].x = action.payload.x;
                 currentState.characters[pid].y = action.payload.y;
                 stateMutated = true;
                 rollResult = `Relocated to coords [${action.payload.x}, ${action.payload.y}]`;
             }
        } else if (action.type === 'EMERGENCY_HEAL' && action.payload) {
             const char = currentState.characters[pid];
             if (char) {
                 const playerEntity: any = {
                    id: pid,
                    stats: { hp_current: char.hp || 0, hp_max: 100 },
                    isDead: false
                 };
                 // Temporary internal pool for now
                 const availableCivilians: any[] = currentState.civilians || [
                    { id: 'civ-1', name: 'Maintenance Tech 44', lifeSupport: 100, isAlive: true },
                    { id: 'civ-2', name: 'Dr. Aris Thorne', lifeSupport: 50, isAlive: true }
                 ];
                 const healCommand = {
                    playerId: pid,
                    requestedHp: action.payload.hpRestored || 25,
                    player: playerEntity,
                    availableCivilians: availableCivilians
                 };
                 // Call domain logic
                 const result = executeEmergencyHeal(healCommand);
                 if (result.isSuccess()) {
                     const successData = result.value;
                     char.hp = successData.newCharacterHp;
                     currentState.civilians = availableCivilians; // Updated by reference in pure func? Wait, pure functions don't update by reference.
                     // The pure function doesn't actually mutate the civilian, we have to do it ourselves:
                     const victim = currentState.civilians.find((c: any) => c.id === successData.generatedCasualty.civilianId);
                     if (victim) {
                         victim.lifeSupport -= successData.actualHpRestored;
                         if (victim.lifeSupport <= 0) victim.isAlive = false;
                     }
                     // Push Trauma Event
                     fbDb.set(fbDb.ref(this.db, `sessions/${this.sessionId()}/gameState/traumaLog/${successData.generatedCasualty.eventId}`), successData.generatedCasualty);
                     
                     stateMutated = true;
                     rollResult = `Injected Auto-Heal. +${successData.actualHpRestored} HP restored. Civilian '${victim?.name}' drained.`;
                 } else {
                     rollResult = `Auto-Heal Failed: ${result.error.message}`;
                 }
             }
        }
        
        // Append to recentRolls / feed
        fbDb.push(fbDb.ref(this.db, `sessions/${this.sessionId()}/gameState/recentRolls`), {
            player: this.protagonistList.find(p => p.id === pid)?.name || pid,
            result: rollResult,
            timestamp: action.timestamp || Date.now()
        });

        // Delete from Action Queue
        fbDb.remove(fbDb.ref(this.db, `sessions/${this.sessionId()}/actionQueue/${key}`));
    });
    
    if (stateMutated && currentState.characters) {
         fbDb.set(fbDb.ref(this.db, `sessions/${this.sessionId()}/gameState/characters`), currentState.characters);
    }
  }

  playerAction(action: string) {
    if (!this.sessionId() || !this.activePlayerId()) return;
    this.actionQueue.dispatchAction(this.sessionId()!, this.activePlayerId()!, action.toUpperCase(), { apCost: 1 });
  }
  
  onDragStart(event: DragEvent, itemId: string) {
     event.dataTransfer?.setData('text/plain', itemId);
  }
  
  onDropItem(event: DragEvent) {
     event.preventDefault();
     const itemId = event.dataTransfer?.getData('text/plain');
     if (!itemId) return;
     
     // Note: Real world position from screen would need Pixi viewport coordinates.
     // For this simulation, we simulate the drop resolution based on the active player's position
     // since they must be near the object to interact anyway!
     const pid = this.activePlayerId();
     const chars = this.gameState()?.characters || {};
     const myChar = chars[pid!];
     if (!myChar) return;
     
     // Expand the hitbox: check a 1.5 radius around the player instead of strict integer match
     const grid = this.gameState()?.map?.grid || {};
     let interacted = false;
     
     // Audit and expand interaction bounding boxes to accommodate drag-and-drop (1.5 radius)
     const radius = 1.5;
     for (const [key, cell] of Object.entries(grid) as [string, any][]) {
        if (cell.type === 'server_rack' || cell.type === 'cupboard' || cell.type === 'storage_box') {
            const [cx, cy] = key.split(',').map(Number);
            const dist = Math.sqrt(Math.pow(myChar.x - cx, 2) + Math.pow(myChar.y - cy, 2));
            if (dist <= radius) {
                interacted = true;
                this.playerAction(`Used ${itemId} on ${cell.type} at ${cx},${cy}`);
                break;
            }
        }
     }
     
     if (!interacted) {
         this.playerAction(`Dropped ${itemId} on the floor.`);
     }
  }
}
