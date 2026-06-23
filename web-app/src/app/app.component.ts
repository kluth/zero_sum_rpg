import { Component, OnInit, OnDestroy, signal, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as tmi from 'tmi.js';
import { FormsModule } from '@angular/forms';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, connectDatabaseEmulator, push, get } from 'firebase/database';
import { PixiMapComponent } from './pixi-map.component';
import { ProgressClockComponent } from './progress-clock.component';
import { FlashbackOverlayComponent } from './flashback-overlay.component';
import { ThreeJsMapComponent } from './threejs-map.component';
import { GridStore, RoomData } from './grid.store';
import { executeEmergencyHeal, EmergencyHealCommand } from '@core-domain/ledger/EmergencyHeal';
import { PlayerCharacter, CivilianEntity } from '@core-domain/ledger/Entities';
import { BillboardComponent } from './ui/billboard/billboard.component';
import { PlayerUplinkComponent } from './ui/player-uplink/player-uplink.component';

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
  imports: [CommonModule, FormsModule, PixiMapComponent, ProgressClockComponent, FlashbackOverlayComponent, ThreeJsMapComponent, BillboardComponent, PlayerUplinkComponent],
  styleUrls: ['./app.component.css'],
  template: `
    <div class="crt-overlay"></div>
    <app-flashback-overlay [isActive]="flashbackActive()" [initiatingPlayer]="flashbackPlayer()" [description]="flashbackDescription()"></app-flashback-overlay>
    
    <!-- LOBBY SCREEN -->
    <div *ngIf="!sessionId()" class="lobby-container">
      <h2 class="header-brutalist " >ZERO SUM RPG</h2>
      
      <input class="cyber-input" type="text" placeholder="ENTER SESSION PIN" [value]="sessionPinInput()" (input)="sessionPinInput.set($any($event.target).value)" >
      <input class="cyber-input" type="text" placeholder="TWITCH CHANNEL (OPTIONAL)" [value]="twitchChannelInput()" (input)="twitchChannelInput.set($any($event.target).value)" >
      
      <div style="display: flex; gap: 20px; flex-wrap: wrap; justify-content: center;">
        <button class="cyber-button" (click)="joinSession('spectator')">SPECTATE</button>
        <button class="cyber-button"  (click)="joinSession('gm')">GAME MASTER</button>
        <button class="cyber-button"  (click)="joinSession('billboard')">DASHBOARD</button>
        <button class="cyber-button"  (click)="joinSession('billboard_v2')">DASHBOARD (V2)</button>
        <button class="cyber-button"  (click)="joinSession('support')">IT SUPPORT SHELL</button>
        <button class="cyber-button"  (click)="joinSession('3d')">3D FLYTHROUGH VIEW</button>
      </div>

      <div style="margin-top: 32px; font-size: 12px; font-family: 'JetBrains Mono', monospace; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.1em;">PROTAGONIST UPLINKS</div>
      <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px;">
        <button *ngFor="let p of protagonistList" class="cyber-button"  (click)="joinSession('player', p.id)">{{p.name}} ({{p.role}})</button>
        <button *ngFor="let p of protagonistList" class="cyber-button"  (click)="joinSession('player_v2', p.id)">{{p.name}} (V2 UPLINK)</button>
      </div>
    </div>

    <!-- MAIN DASHBOARD -->
    <div *ngIf="sessionId()" class="main-dashboard-wrapper">
      
      <!-- Pulsating Alert Bar -->
      <div *ngIf="heatLevel() >= 8 || recentTrauma()" class="pulsating-alert-bar header-brutalist chromatic" style="color: white; padding: clamp(8px, 1.5vh, 15px); font-size: clamp(16px, 2.5vh, 28px); text-align: center; border: 1px solid rgba(255, 255, 255, 0.08); flex-shrink: 0;">
        ⚠️ CRITICAL ALERT: {{ heatLevel() >= 8 ? 'HIGH HEAT LEVEL DETECTED (' + heatLevel() + '/10). ' : '' }} {{ recentTrauma() ? 'LIFE SUPPORT SYSTEM FAILURE: ' + recentTrauma().civilian : '' }}
      </div>

      @defer (when isGmMode()) {
        <!-- GM Map Builder Logic here -->
        <header class="glass-panel gm-panel" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: clamp(4px, 1vw, 10px); flex-shrink: 0; padding: clamp(8px, 1.5vh, 20px);">
          <h1 class="header-brutalist" style="margin: 0; font-size: clamp(18px, 3vh, 32px);">ZERO SUM <span class="">GAME MASTER</span></h1>
          <div class="data-mono" style="font-size: clamp(12px, 1.5vh, 18px); color: gray;">SESSION: <strong style="color: white; font-size: clamp(14px, 2vh, 24px);">{{ sessionId() }}</strong></div>
        </header>
        
        <div class="gm-grid">
            <!-- PANE A: Canvas Viewport -->
            <div class="glass-panel gm-panel" style="flex: 2; display: flex; flex-direction: column; overflow: hidden; padding: 0; position: relative;">
               <ng-container *ngIf="!show3d(); else threeDViewGM">
                  <div style="flex: 1; overflow: hidden; display: flex;">
                     <app-pixi-map 
                        [mode]="'gm'"
                        [characters]="gameState().characters || {}"
                        [activePlayerId]="activePlayerId()"
                        [paintMode]="activePaintMode()"
                        [currentLevel]="currentLevel()"
                        (cellClicked)="onCanvasCellClicked($event)" 
                        (roomClicked)="onCanvasRoomClicked($event)"
                        (cellPainted)="onCellPainted($event)"
                        style="flex: 1; display: block; overflow: hidden;">
                     </app-pixi-map>
                  </div>
               </ng-container>
               <ng-template #threeDViewGM>
                 <app-threejs-map [characters]="gameState().characters || {}" [mode]="'gm'" style="flex: 1;"></app-threejs-map>
               </ng-template>
            </div>
            
            <!-- PANE B: Combined Tools -->
            <div class="glass-panel" style="flex: 1; display: flex; flex-direction: column; padding: clamp(8px, 1vh, 16px);">
               <!-- Heat & Command (Always top) -->
               <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed gray; padding-bottom: 5px; flex-shrink: 0;">
                  <h3 style="margin:0; font-size: clamp(12px, 1.5vh, 16px);">HEAT: {{ heatLevel() }}</h3>
                  <div style="display: flex; gap: 5px;">
                     <button class="cyber-button" style="margin:0; padding: clamp(2px, 0.5vh, 6px);" (click)="updateHeat(-1)">-</button>
                     <button class="cyber-button" style="margin:0; padding: clamp(2px, 0.5vh, 6px);" (click)="updateHeat(1)">+</button>
                  </div>
                  <button class="cyber-button" style="margin:0; font-size: clamp(8px, 1vh, 12px); padding: clamp(2px, 0.5vh, 6px);" (click)="show3d.set(!show3d())">3D/2D</button>
                  <button class="cyber-button" style="margin:0; font-size: clamp(8px, 1vh, 12px); padding: clamp(2px, 0.5vh, 6px);" (click)="publishMap()">SYNC</button>
               </div>

               <!-- Three Columns for Tools -->
               <div class="gm-tools-row" style="margin-top: clamp(4px, 1vh, 10px);">
                  
                  <!-- COL 1: BLOCKS -->
                  <div class="gm-tools-col">
                     <h3 style="font-size: clamp(10px, 1.2vh, 14px); margin:0;">BLOCKS & GEN</h3>
                     <div style="display: grid; grid-template-columns: 1fr 1fr; gap: clamp(2px, 0.5vh, 5px);">
                        <div class="prefab-block" (click)="selectPrefab('corridor')" [ngClass]="{'selected': activePrefab() === 'corridor'}">Corridor</div>
                        <div class="prefab-block" (click)="selectPrefab('l_junction')" [ngClass]="{'selected': activePrefab() === 'l_junction'}">L-Junc</div>
                        <div class="prefab-block" (click)="selectPrefab('medbay')" [ngClass]="{'selected': activePrefab() === 'medbay'}">MedBay</div>
                        <div class="prefab-block" (click)="selectPrefab('data_terminal')" [ngClass]="{'selected': activePrefab() === 'data_terminal'}">Terminal</div>
                     </div>
                     <button class="cyber-button" style="margin:0; padding: clamp(2px, 0.5vh, 6px);" (click)="generateProceduralFacility()">GEN. FACILITY</button>
                     <div style="display: flex; gap: 2px;">
                        <button class="cyber-button" style="flex:1; margin:0; padding: clamp(2px, 0.5vh, 6px);" [style.background]="currentLevel() === 1 ? '#555' : 'transparent'" (click)="currentLevel.set(1)">L1</button>
                        <button class="cyber-button" style="flex:1; margin:0; padding: clamp(2px, 0.5vh, 6px);" [style.background]="currentLevel() === 2 ? '#555' : 'transparent'" (click)="currentLevel.set(2)">L2</button>
                     </div>
                  </div>

                  <!-- COL 2: PAINT -->
                  <div class="gm-tools-col">
                     <h3 style="font-size: clamp(10px, 1.2vh, 14px); margin:0;">PAINT</h3>
                     <div style="display: grid; grid-template-columns: 1fr 1fr; gap: clamp(2px, 0.5vh, 5px);">
                        <button class="tool-btn" [class.active]="activePaintMode() === 'wall'" (click)="activePaintMode.set('wall')">Wall</button>
                        <button class="tool-btn" [class.active]="activePaintMode() === 'breakable_wall'" (click)="activePaintMode.set('breakable_wall')">Break</button>
                        <button class="tool-btn" [class.active]="activePaintMode() === 'door_locked'" (click)="activePaintMode.set('door_locked')">Door L</button>
                        <button class="tool-btn" [class.active]="activePaintMode() === 'door_open'" (click)="activePaintMode.set('door_open')">Door O</button>
                        <button class="tool-btn" [class.active]="activePaintMode() === 'cctv'" (click)="activePaintMode.set('cctv')">CCTV</button>
                        <button class="tool-btn" [class.active]="activePaintMode() === 'furniture'" (click)="activePaintMode.set('furniture')">Term</button>
                        <button class="tool-btn" [class.active]="activePaintMode() === 'floor'" (click)="activePaintMode.set('floor')">Erase</button>
                     </div>
                  </div>

                  <!-- COL 3: PROPS & CMD -->
                  <div class="gm-tools-col">
                     <h3 style="font-size: clamp(10px, 1.2vh, 14px); margin:0;">PROPS & CMD</h3>
                     <div *ngIf="selectedRoomId(); else noSelection" style="display: flex; flex-direction: column; gap: clamp(2px, 0.5vh, 4px);">
                        <input type="text" [ngModel]="getRoomTag()" (ngModelChange)="updateRoomTag($event)" placeholder="Room Tag" />
                        <select [ngModel]="getRoomVfx()" (ngModelChange)="updateRoomVfx($event)">
                           <option value="none">VFX: None</option>
                           <option value="flash_red_alert">VFX: Alarm</option>
                           <option value="flicker_blue_data">VFX: Data</option>
                        </select>
                     </div>
                     <ng-template #noSelection>
                        <div style="font-size: clamp(8px, 1vh, 10px); color: gray;">No Room Sel.</div>
                     </ng-template>

                     <div style="margin-top: auto; display: grid; grid-template-columns: 1fr 1fr; gap: clamp(2px, 0.5vh, 4px);">
                        <button class="cyber-button" style="margin:0; padding: clamp(2px, 0.5vh, 6px);" (click)="deploySquad()">DEPLOY</button>
                        <button class="cyber-button" style="margin:0; padding: clamp(2px, 0.5vh, 6px);" (click)="dealDamageToSquad()">20 DMG</button>
                        <button class="cyber-button" style="margin:0; padding: clamp(2px, 0.5vh, 6px);" (click)="inflictStressToSquad()">+20 STR</button>
                        <button class="cyber-button" style="margin:0; padding: clamp(2px, 0.5vh, 6px);" (click)="spawnTraumaEvent()">LOG CAS</button>
                     </div>
                  </div>

               </div>
            </div>
        </div>
      }
      
      @defer (when isBillboardMode()) {
        <!-- DASHBOARD TV -->
        <div class="billboard-container" [ngClass]="{'alarm-mode': heatLevel() >= 8 || recentTrauma()}" style="display: flex; flex-direction: column; height: 100%; overflow: hidden; padding: clamp(10px, 2vh, 30px); position: relative; box-sizing: border-box;">
            <div *ngIf="heatLevel() >= 8 || recentTrauma()" style="position: absolute; top:0; left:0; width:100%; height:100%; background: radial-gradient(circle, transparent 20%, rgba(255,0,60,0.5) 100%); pointer-events:none;"></div>
            
            <h1 class="header-brutalist chromatic" [style.color]="heatLevel() >= 8 ? '#FF003C' : '#00F0FF'" style="font-size: clamp(40px, min(8vw, 12vh), 140px); margin: 0; animation: blink 2s infinite; text-transform: uppercase; text-align: center; flex-shrink: 0; z-index: 1;">GLOBAL HEAT: {{ heatLevel() }}</h1>
            
            <h2 class="header-brutalist" *ngIf="recentTrauma()" style="text-align: center; color: #FF003C; flex-shrink: 0; z-index: 1; font-size: clamp(20px, 4vw, 40px);">
                LIFE SUPPORT REDIRECTED.<br/>CASUALTY: {{ recentTrauma().civilian }}
            </h2>
            
            <div *ngIf="!recentTrauma()" style="display: flex; flex: 1; gap: clamp(10px, 2vw, 30px); margin-top: clamp(10px, 2vh, 30px); overflow: hidden; z-index: 1;">
               <!-- OPERATIVE STATUS METRICS -->
               <div class="glass-panel" style="flex: 1; display: flex; flex-direction: column; overflow: hidden; justify-content: space-evenly; align-items: center; text-align: center; padding: clamp(10px, 2vh, 30px);">
                  <h3 class="header-brutalist " style="font-size: clamp(18px, min(3vw, 4vh), 36px); border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: clamp(5px, 1vh, 10px); width: 100%; margin: 0;">OPERATIVE STATUS</h3>
                  
                  <div>
                     <div style="font-size: clamp(12px, 2vh, 20px); color: #d4d4d8;">SQUAD VITALITY (HP)</div>
                     <div class="data-mono" style="font-size: clamp(24px, 4vh, 48px); color: #39FF14; font-weight: bold;">{{ squadHpAvg() }}%</div>
                     <div style="font-size: clamp(10px, 1.5vh, 14px); color: gray; max-width: 80%;">Measures the average physical integrity of active operatives.</div>
                  </div>
                  
                  <div>
                     <div style="font-size: clamp(12px, 2vh, 20px); color: #d4d4d8;">ALLOSTATIC LOAD (STRESS)</div>
                     <div class="data-mono" style="font-size: clamp(24px, 4vh, 48px); color: #FF003C; font-weight: bold;">{{ squadStressAvg() }}%</div>
                     <div style="font-size: clamp(10px, 1.5vh, 14px); color: gray; max-width: 80%;">Average psychological deterioration. High levels lead to deterioration.</div>
                  </div>
                  
                  <div>
                     <div style="font-size: clamp(12px, 2vh, 20px); color: #d4d4d8;">CONFIRMED CASUALTIES</div>
                     <div class="data-mono" style="font-size: clamp(24px, 4vh, 48px); color: white; font-weight: bold;">{{ traumaCount() }}</div>
                     <div style="font-size: clamp(10px, 1.5vh, 14px); color: gray; max-width: 80%;">Collateral civilian damage logged by corporate oversight.</div>
                  </div>
               </div>
               
               <!-- TWITCH CHAOS INTERACTION INSTRUCTIONS -->
               <div class="glass-panel" style="flex: 1; display: flex; flex-direction: column; overflow: hidden; justify-content: space-evenly; align-items: center; text-align: center; padding: clamp(10px, 2vh, 30px);">
                  <h3 class="header-brutalist " style="font-size: clamp(18px, min(3vw, 4vh), 36px); border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: clamp(5px, 1vh, 10px); width: 100%; margin: 0;">SPECTATOR OVERRIDE</h3>
                  
                  <div style="font-size: clamp(12px, 1.8vh, 18px); max-width: 90%; color: #d4d4d8;">
                    YOU ARE AUTHORIZED TO INFLUENCE THE OPERATION. USE TWITCH CHAT TO INJECT CHAOS INTO THE MARKET. THE GAME MASTER WILL USE MARKET FUNDS AGAINST THE SQUAD.
                  </div>
                  
                  <div style="display: flex; flex-direction: column; gap: clamp(10px, 2vh, 20px); width: 100%;">
                     <div style="background: rgba(255,255,255,0.05); padding: clamp(10px, 2vh, 20px); border-radius: 0px;">
                        <span style="font-size: clamp(14px, min(2vw, 3vh), 24px); font-weight: bold; color: white;">TYPE <span style="color:#00F0FF;">!chaos</span> IN CHAT</span><br/>
                        <span style="font-size: clamp(10px, 1.5vh, 14px); color: gray;">Adds $10 to the Chaos Market. FREE.</span>
                     </div>
                     <div style="background: rgba(255,255,255,0.05); padding: clamp(10px, 2vh, 20px); border-radius: 0px;">
                        <span style="font-size: clamp(14px, min(2vw, 3vh), 24px); font-weight: bold; color: white;">CHEER BITS</span><br/>
                        <span style="font-size: clamp(10px, 1.5vh, 14px); color: gray;">Adds proportional Chaos to the Market.</span>
                     </div>
                  </div>
                  
                  <h3 class="header-brutalist " style="text-align: center; font-size: clamp(20px, min(4vw, 5vh), 48px); margin: 0; border: 2px dashed #00F0FF; padding: clamp(10px, 2vh, 20px); width: 80%;">MARKET: $ {{ chaosMarketValue() }}</h3>
               </div>
            </div>
        </div>
      }
      
      @defer (when isSupportMode()) {
        <!-- NETRUNNER ICE TERMINAL -->
        <div class="terminal glass-panel" >
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: 1vh;">
            <h2 class="header-brutalist " style="margin: 0; font-size: 32px;">SERVER ADMINISTRATION</h2>
            <button class="cyber-button"  (click)="connectBleBeacon()">[BLE AIR-GAP] CONNECT BEACON</button>
          </div>
          <div style="height: 80%; overflow-y: auto; margin-top: 10px; margin-bottom: 1vh; font-size: 18px; line-height: 1.5;" id="terminalOutput" class="data-mono">
            <div *ngFor="let log of terminalLogs()">> {{ log }}</div>
          </div>
          <div >
            <span >$</span>
            <input type="text" [(ngModel)]="terminalCommand" (keyup.enter)="executeIceCommand()"  placeholder="grep the mainframe..." autofocus />
          </div>
        </div>
      }
      
      @defer (when isSpectatorMode()) {
        <div class="glass-panel" style="display: flex; flex-direction: column; height: 100%; overflow: hidden; padding: clamp(8px, 1.5vh, 20px);">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: clamp(4px, 1vw, 10px); border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: clamp(8px, 1.5vh, 15px); flex-shrink: 0;">
              <h2 class="header-brutalist " style="font-size: clamp(18px, 3vh, 36px); margin: 0;">SPECTATOR UPLINK // TWITCH</h2>
              <div style="display: flex; gap: clamp(4px, 1vw, 10px); flex-wrap: wrap; align-items: center;">
                <button class="cyber-button" style="margin: 0; font-size: clamp(10px, 1.2vh, 14px); padding: clamp(4px, 1vh, 10px);" (click)="show3d.set(!show3d())">3D VIEW</button>
                <div class="data-mono" style="font-size: clamp(12px, 1.5vh, 16px);">MARKET: $ {{ chaosMarketValue() }}</div>
                <div class="data-mono" style="font-size: clamp(12px, 1.5vh, 16px);">HEAT: {{ heatLevel() }}</div>
              </div>
            </div>
            
            <div class="spectator-grid-cams" style="margin-top: clamp(8px, 1.5vh, 15px); flex: 1; overflow: hidden;">
              <!-- Webcams (Always visible on desktop now) -->
              <div class="glass-panel webcam-pane" style="flex: 0 0 clamp(100px, 15vw, 200px); padding: clamp(4px, 1vh, 10px); overflow: hidden;">
                <h3 class="header-brutalist " style="margin-top: 0; font-size: clamp(12px, 1.5vh, 16px); flex-shrink: 0;">CAMS</h3>
                <div style="display: flex; flex-direction: column; gap: clamp(4px, 1vh, 10px); flex: 1; overflow: hidden;">
                  <div *ngFor="let key of getCharacterKeys()" style="position: relative; aspect-ratio: 16/9; background: #111; border: 1px solid #333; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                    <div style="color: white; font-family: 'JetBrains Mono', monospace; font-size: clamp(6px, 1vh, 10px); position: absolute; top: 2px; left: 2px; background: black; padding: 2px; border: 1px solid #39FF14; z-index: 2;">{{ gameState().characters[key].name }}</div>
                  </div>
                </div>
              </div>
              
              <!-- Left column: Logs -->
              <div class="glass-panel left-pane" style="flex: 0 0 clamp(150px, 20vw, 300px); padding: clamp(4px, 1vh, 10px); overflow: hidden;">
                <h3 class="header-brutalist " style="margin-top: 0; font-size: clamp(12px, 1.5vh, 16px); flex-shrink: 0;">FEED</h3>
                <div class="scrolling-logs" style="flex: 1; overflow: hidden; display: flex; flex-direction: column; gap: clamp(2px, 0.5vh, 8px);">
                  <div *ngFor="let roll of gameState().recentRolls || []" style="border-bottom: 1px dashed rgba(57,255,20,0.3); padding: clamp(2px, 0.5vh, 8px) 0; flex-shrink: 0; font-size: clamp(8px, 1.2vh, 12px);">
                    [{{ roll.timestamp | date:'HH:mm:ss' }}] ROLL: {{ roll.player }} -> {{ roll.result }}
                  </div>
                </div>
              </div>
              
              <!-- Center column: Map -->
              <div class="glass-panel" style="flex: 1; display: flex; flex-direction: column; overflow: hidden; padding: 0;">
                <ng-container *ngIf="!show3d(); else threeDViewSpec">
                  <app-pixi-map [mode]="'spectator'" [characters]="gameState().characters || {}" [currentLevel]="currentLevel()" style="flex: 1; display: block; overflow: hidden;"></app-pixi-map>
                </ng-container>
                <ng-template #threeDViewSpec>
                  <app-threejs-map [characters]="gameState().characters || {}" [mode]="'spectator'" style="flex: 1;"></app-threejs-map>
                </ng-template>
              </div>
              
              <!-- Right column: Squad status & Clocks -->
              <div class="glass-panel right-pane" style="flex: 0 0 clamp(200px, 20vw, 300px); padding: clamp(4px, 1vh, 10px); overflow: hidden;">
                <h3 class="header-brutalist " style="margin-top: 0; font-size: clamp(12px, 1.5vh, 16px); flex-shrink: 0;">THREATS</h3>
                <div style="display: flex; flex-wrap: wrap; gap: clamp(2px, 0.5vh, 5px); margin-bottom: clamp(4px, 1vh, 10px); flex-shrink: 0;">
                  <app-progress-clock *ngFor="let clock of getPublicClocks()" 
                      [name]="clock.name" [segments]="clock.segments" [filled]="clock.filled" [color]="clock.color" style="transform: scale(0.6); transform-origin: top left;">
                  </app-progress-clock>
                </div>
                
                <h3 class="header-brutalist " style="margin-top: 0; font-size: clamp(12px, 1.5vh, 16px); flex-shrink: 0;">SQUAD</h3>
                <div style="display: flex; flex-direction: column; gap: clamp(2px, 0.5vh, 5px); flex: 1; overflow: hidden;">
                  <div *ngFor="let key of getCharacterKeys()" class="squad-card" [ngStyle]="{'background': (gameState().characters[key].stats?.hp_current || 100) <= 0 ? 'rgba(255,0,60,0.1)' : 'rgba(0,240,255,0.05)'}" style="border: 2px solid #00F0FF; padding: clamp(2px, 0.5vh, 5px); font-family: 'JetBrains Mono', monospace; font-size: clamp(8px, 1.2vh, 12px); flex-shrink: 1; min-height: 0;">
                    <div [style.color]="(gameState().characters[key].stats?.hp_current || 100) <= 0 ? 'gray' : '#39FF14'" style="font-weight: bold; border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: 2px; margin-bottom: 2px;">
                      {{ gameState().characters[key].name }}
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                      <span>HP: {{ gameState().characters[key].stats?.hp_current || 100 }}</span>
                      <span>STL: {{ gameState().characters[key].stats?.stealth_total || 0 }}</span>
                      <span>STR: {{ gameState().characters[key].stats?.stress_current || 0 }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </div>
      }

      @defer (when isPlayerMode()) {
        <div class="glass-panel" style="display: flex; flex-direction: column; height: 100%; overflow: hidden; padding: clamp(8px, 1.5vh, 20px);">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: clamp(4px, 1vw, 10px); border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: clamp(4px, 1vh, 10px); flex-shrink: 0;">
              <h2 class="header-brutalist " style="font-size: clamp(18px, 3vh, 32px); margin: 0;">UPLINK // {{ getPlayerName() }}</h2>
              <div class="data-mono" style="font-size: clamp(12px, 1.5vh, 16px);">ROLE: {{ getPlayerRole() }}</div>
              
              <div *ngIf="myCharStats()" style="display: flex; gap: clamp(5px, 1vw, 10px); flex-wrap: wrap;">
                  <div class="data-mono" style="font-size: clamp(12px, 1.5vh, 16px);">HP: {{ myCharStats().hp_current }}</div>
                  <div class="data-mono" style="font-size: clamp(12px, 1.5vh, 16px);">STR: {{ myCharStats().stress_current }}</div>
                  <div class="data-mono" style="font-size: clamp(12px, 1.5vh, 16px);">STL: {{ myCharStats().stealth_total }}</div>
              </div>
              
              <button class="cyber-button" style="margin: 0; padding: clamp(4px, 1vh, 8px) clamp(8px, 1vw, 12px); font-size: clamp(10px, 1.2vh, 14px);" (click)="triggerEmergencyHeal()">[ZERO SUM] EMERGENCY HEAL</button>
              
              <div class="data-mono" style="font-size: clamp(12px, 1.5vh, 16px);">HEAT: {{ heatLevel() }}</div>
              <button class="cyber-button" style="margin: 0; padding: clamp(4px, 1vh, 8px) clamp(8px, 1vw, 12px); font-size: clamp(10px, 1.2vh, 14px);" (click)="show3d.set(!show3d())">3D / 2D</button>
            </div>
            
            <div class="player-grid" style="display: flex; flex: 1; gap: clamp(8px, 1.5vw, 15px); margin-top: clamp(8px, 1.5vh, 15px); overflow: hidden;">
              
              <!-- Left Column: Inventory -->
              <div class="glass-panel" style="flex: 0 0 clamp(120px, 15vw, 200px); display: flex; flex-direction: column; overflow: hidden; padding: clamp(4px, 1vh, 10px);">
                <h3 class="header-brutalist " style="margin-top: 0; margin-bottom: clamp(4px, 1vh, 10px); font-size: clamp(12px, 1.5vh, 16px); border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: 5px; flex-shrink: 0;">INVENTORY</h3>
                <div style="display: flex; flex-direction: column; gap: clamp(4px, 1vh, 10px); overflow-y: auto;">
                  <div draggable="true" (dragstart)="onDragStart($event, 'usb_drive')" style="border: 1px dashed rgba(255,255,255,0.2); padding: clamp(4px, 1vh, 10px); text-align: center; cursor: grab; font-size: clamp(10px, 1.2vh, 14px); background: rgba(0,0,0,0.2);">USB DRIVE</div>
                  <div draggable="true" (dragstart)="onDragStart($event, 'c4_explosive')" style="border: 1px dashed rgba(255,255,255,0.2); padding: clamp(4px, 1vh, 10px); text-align: center; cursor: grab; font-size: clamp(10px, 1.2vh, 14px); background: rgba(0,0,0,0.2);">C4 CHARGE</div>
                </div>
              </div>
              
              <!-- Center Column: Map -->
              <div class="glass-panel" style="flex: 1; position: relative; border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.5); padding: 0; overflow: hidden; display: flex;" (dragover)="$event.preventDefault()" (drop)="onDropItem($event)">
                 <ng-container *ngIf="!show3d(); else threeDViewPlayer">
                   <app-pixi-map [mode]="'player'" [characters]="gameState().characters || {}" [activePlayerId]="activePlayerId()" [currentLevel]="currentLevel()" (playerMoved)="onPlayerMoved($event)" style="flex: 1; display: block; overflow: hidden;"></app-pixi-map>
                 </ng-container>
                 <ng-template #threeDViewPlayer>
                   <app-threejs-map [characters]="gameState().characters || {}" [mode]="'player'" style="flex: 1;"></app-threejs-map>
                 </ng-template>
              </div>
              
              <!-- Right Column: Actions -->
              <div class="glass-panel" style="flex: 0 0 clamp(150px, 20vw, 250px); display: flex; flex-direction: column; overflow: hidden; padding: clamp(4px, 1vh, 10px);">
                <h3 class="header-brutalist " style="margin-top: 0; margin-bottom: clamp(4px, 1vh, 10px); font-size: clamp(12px, 1.5vh, 16px); border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: 5px; flex-shrink: 0;">ACTIONS</h3>
                <div style="display: flex; flex-direction: column; gap: clamp(4px, 1vh, 10px); flex: 1; justify-content: center; overflow-y: auto;">
                  <button class="cyber-button" style="margin: 0; font-size: clamp(12px, 2vh, 20px); padding: clamp(8px, 1.5vh, 15px); text-align: left;" (click)="playerAction('attack')">ATTACK</button>
                  <button class="cyber-button" style="margin: 0; font-size: clamp(12px, 2vh, 20px); padding: clamp(8px, 1.5vh, 15px); text-align: left;" (click)="playerAction('sneak')">SNEAK</button>
                  <button class="cyber-button" style="margin: 0; font-size: clamp(12px, 2vh, 20px); padding: clamp(8px, 1.5vh, 15px); text-align: left;" (click)="playerAction('dash')">DASH</button>
                  <button class="cyber-button" style="margin: 0; font-size: clamp(12px, 2vh, 20px); padding: clamp(8px, 1.5vh, 15px); text-align: left;" (click)="playerAction('investigate')">INVESTIGATE</button>
                  <button class="cyber-button" style="margin: 0; font-size: clamp(12px, 2vh, 20px); padding: clamp(8px, 1.5vh, 15px); text-align: left;" (click)="playerAction('sabotage')">SABOTAGE</button>
                </div>
              </div>
              
            </div>
        </div>
      }

      @defer (when is3dMode()) {
        <div class="glass-panel" >
           <header class="glass-panel" >
             <h2 class="header-brutalist" >3D FLYTHROUGH VIEW</h2>
             <button class="cyber-button" style="margin-top: 0; padding: 5px 15px;" (click)="mode.set(null)">EXIT</button>
           </header>
           <div style="flex: 1; position: relative; border: 2px solid #FF00FF;">
             <app-threejs-map [characters]="gameState().characters || {}" [mode]="'3d'"></app-threejs-map>
           </div>
        </div>
      }

      @defer (when mode() === 'billboard_v2') {
         <div style="height: 100dvh; max-height: 100dvh; overflow: hidden;">
            <app-billboard></app-billboard>
         </div>
      }

      @defer (when mode() === 'player_v2') {
         <div style="height: 100dvh; max-height: 100dvh; overflow: hidden;">
            <app-player-uplink></app-player-uplink>
         </div>
      }

    </div>
  `
})
export class AppComponent implements OnInit, OnDestroy {
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
    this.app = initializeApp(firebaseConfig);
    this.db = getDatabase(this.app);
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      connectDatabaseEmulator(this.db, 'localhost', 9000);
    }

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
      const token = params.get('token');
      
      let session = params.get('session');
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
        this.sessionId.set(session);
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
         this.updateCell(pos.x + dx, pos.y + dy, { type: 'structure_wall', room_id: roomId });
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
    
    // Clean slate for current level
    const currentZ = this.currentLevel();
    // Keep other levels intact, only clear this level's cells and rooms (simplification: we'll just clear rooms for now)
    this.gridStore.setState({ dimensions: { width: 50, height: 30 } }); // state is preserved, we just overwrite
    
    // BSP / Sequential Connected Rooms
    const newRooms: Record<string, any> = {};
    const roomCenters: {x: number, y: number}[] = [];
    
    for (let i = 0; i < 6; i++) {
        const roomId = `room_${Math.random().toString(36).substr(2, 6)}`;
        const w = Math.floor(Math.random() * 6) + 5;
        const h = Math.floor(Math.random() * 6) + 5;
        const x = Math.floor(Math.random() * (48 - w)) + 1;
        const y = Math.floor(Math.random() * (28 - h)) + 1;
        
        newRooms[roomId] = {
            tag: `Sector ${i+1}`,
            bounds: { x, y, z: currentZ, w, h },
            color: i === 0 ? '#FF003C' : '#39FF14',
            metadata: { threat: i === 0 ? 'critical' : 'medium', vfx: i === 0 ? 'flash_red_alert' : 'none' }
        };
        
        // Fill floor
        for (let r_x = x + 1; r_x < x + w - 1; r_x++) {
            for (let r_y = y + 1; r_y < y + h - 1; r_y++) {
               this.updateCell(r_x, r_y, { type: 'floor', room_id: roomId });
            }
        }
        
        // Add walls
        for (let r_x = x; r_x < x + w; r_x++) {
            for (let r_y = y; r_y < y + h; r_y++) {
               if (r_x === x || r_x === x + w - 1 || r_y === y || r_y === y + h - 1) {
                   this.updateCell(r_x, r_y, { type: 'structure_wall', room_id: roomId });
               }
            }
        }
        
        roomCenters.push({ x: Math.floor(x + w/2), y: Math.floor(y + h/2) });
    }
    
    // Connect rooms sequentially to guarantee traversability
    for (let i = 1; i < roomCenters.length; i++) {
        const c1 = roomCenters[i-1];
        const c2 = roomCenters[i];
        
        // Draw L-shaped corridor
        let cx = c1.x;
        let cy = c1.y;
        while (cx !== c2.x) {
            cx += cx < c2.x ? 1 : -1;
            // Carve floor and doors
            const cell = this.gridStore.grid()[`${cx},${cy},${currentZ}`];
            if (cell && cell.type === 'structure_wall') {
                this.updateCell(cx, cy, { type: Math.random() > 0.5 ? 'door_locked' : 'breakable_wall' });
            } else if (!cell || cell.type === 'empty') {
                this.updateCell(cx, cy, { type: 'floor' });
                // Add corridor walls if empty
                if (!this.gridStore.grid()[`${cx},${cy-1},${currentZ}`]) this.updateCell(cx, cy-1, { type: 'structure_wall' });
                if (!this.gridStore.grid()[`${cx},${cy+1},${currentZ}`]) this.updateCell(cx, cy+1, { type: 'structure_wall' });
            }
        }
        while (cy !== c2.y) {
            cy += cy < c2.y ? 1 : -1;
            const cell = this.gridStore.grid()[`${cx},${cy},${currentZ}`];
            if (cell && cell.type === 'structure_wall') {
                this.updateCell(cx, cy, { type: Math.random() > 0.5 ? 'door_locked' : 'door_open' });
            } else if (!cell || cell.type === 'empty') {
                this.updateCell(cx, cy, { type: 'floor' });
                if (!this.gridStore.grid()[`${cx-1},${cy},${currentZ}`]) this.updateCell(cx-1, cy, { type: 'structure_wall' });
                if (!this.gridStore.grid()[`${cx+1},${cy},${currentZ}`]) this.updateCell(cx+1, cy, { type: 'structure_wall' });
            }
        }
    }
    
    // Add outdoor grass/street near edges
    for (let x = 0; x < 50; x++) {
        for (let y = 0; y < 30; y++) {
            if (!this.gridStore.grid()[`${x},${y},${currentZ}`]) {
                if (Math.random() > 0.95) this.updateCell(x, y, { type: 'grass' });
                else if (Math.random() > 0.98) this.updateCell(x, y, { type: 'street' });
            }
        }
    }
    
    Object.keys(newRooms).forEach(k => this.gridStore.updateRoom(k, newRooms[k]));
    
    this.wfcError.set("FACILITY GENERATED SUCCESSFULLY. ALL ROOMS CONNECTED.");
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
    const room = this.gridStore.rooms()[roomId];
    if (!room || !room.bounds) return;

    const { x, y, w, h } = room.bounds;

    // Clear interior
    for (let r_x = x + 1; r_x < x + w - 1; r_x++) {
        for (let r_y = y + 1; r_y < y + h - 1; r_y++) {
            this.updateCell(r_x, r_y, { type: 'floor', room_id: roomId } as any);
        }
    }

    if (templateName === 'office') {
       this.updateRoomTag("Corporate Office");
       // Place cupboards (lockers) in corners
       this.updateCell(x + 1, y + 1, { type: 'cupboard', room_id: roomId } as any);
       this.updateCell(x + w - 2, y + h - 2, { type: 'cupboard', room_id: roomId } as any);
       // Add a center terminal
       this.updateCell(x + Math.floor(w/2), y + Math.floor(h/2), { type: 'furniture', room_id: roomId } as any);
       // Add data pad
       this.updateCell(x + Math.floor(w/2) + 1, y + Math.floor(h/2), { type: 'floor', room_id: roomId, inventory: [{ id: 'datapad', name: 'Secure Datapad' }] } as any);
    } 
    else if (templateName === 'storage') {
       this.updateRoomTag("Storage Area");
       // Place random clusters of crates (inventory) and large storage boxes
       for (let r_x = x + 1; r_x < x + w - 1; r_x++) {
           for (let r_y = y + 1; r_y < y + h - 1; r_y++) {
               const rand = Math.random();
               if (rand > 0.8) {
                   this.updateCell(r_x, r_y, { type: 'storage_box', room_id: roomId } as any);
               } else if (rand > 0.6) {
                   this.updateCell(r_x, r_y, { type: 'floor', room_id: roomId, inventory: [{ id: 'scrap', name: 'Tech Scrap' }] } as any);
               }
           }
       }
       // Make one of the surrounding walls breakable for a secret hideout
       this.updateCell(x + Math.floor(w/2), y, { type: 'breakable_wall', room_id: roomId } as any);
    }
    else if (templateName === 'server_room') {
       this.updateRoomTag("Server Mainframe");
       this.updateRoomVfx('flicker_blue_data');
       this.updateRoomThreat('medium');
       // Create rows of servers
       for (let r_x = x + 2; r_x < x + w - 2; r_x += 2) {
           for (let r_y = y + 1; r_y < y + h - 1; r_y++) {
               if (r_y !== y + Math.floor(h/2)) { // Leave a center aisle
                   this.updateCell(r_x, r_y, { type: 'server_rack', room_id: roomId } as any);
               }
           }
       }
    }
    else if (templateName === 'medbay') {
       this.updateRoomTag("Medical Bay");
       this.updateRoomVfx('flash_red_alert');
       this.updateRoomThreat('critical');
       // Place beds along the wall
       for (let r_x = x + 1; r_x < x + w - 1; r_x += 2) {
           this.updateCell(r_x, y + 1, { type: 'furniture', room_id: roomId } as any);
           this.updateCell(r_x, y + 2, { type: 'floor', room_id: roomId, inventory: [{ id: 'medkit', name: 'Emergency Medkit' }] } as any);
       }
    }

    // Ensure there is at least one door on the border
    let hasDoor = false;
    for (let r_x = x; r_x < x + w; r_x++) {
        for (let r_y = y; r_y < y + h; r_y++) {
           if (r_x === x || r_x === x + w - 1 || r_y === y || r_y === y + h - 1) {
              const cell = this.gridStore.grid()[`${r_x},${r_y}`];
              if (cell && (cell.type === 'door_locked' || cell.type === 'door_open')) {
                 hasDoor = true;
              }
           }
        }
    }
    if (!hasDoor) {
       this.updateCell(x + Math.floor(w/2), y, { type: 'door_locked', room_id: roomId } as any);
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
      const dbRef = ref(this.db, `sessions/${pin}/gameState/twitchChannel`);
      set(dbRef, this.twitchChannelInput().toLowerCase()).then(() => {
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
      set(ref(this.db, `sessions/${this.sessionId()}/gameState/characters`), chars);
  }

  dealDamageToSquad() {
     if (!this.db || !this.sessionId()) return;
     const chars = this.gameState().characters || {};
     const updated = { ...chars };
     Object.keys(updated).forEach(key => {
        if (!updated[key].stats) return;
        updated[key].stats.hp_current = Math.max(0, updated[key].stats.hp_current - 20);
     });
     set(ref(this.db, `sessions/${this.sessionId()}/gameState/characters`), updated);
  }

  inflictStressToSquad() {
     if (!this.db || !this.sessionId()) return;
     const chars = this.gameState().characters || {};
     const updated = { ...chars };
     Object.keys(updated).forEach(key => {
        if (!updated[key].stats) return;
        updated[key].stats.stress_current = Math.min(100, updated[key].stats.stress_current + 20);
     });
     set(ref(this.db, `sessions/${this.sessionId()}/gameState/characters`), updated);
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
     set(ref(this.db, `sessions/${this.sessionId()}/gameState/traumaLog/${eventId}`), logEntry);
     this.updateHeat(1);
  }

  connectFirebase() {
    const stateRef = ref(this.db, `sessions/${this.sessionId()}/gameState`);
    onValue(stateRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        if (this.isGmMode() && data.twitchChannel && !this.tmiClient) {
          this.initTmiClient(data.twitchChannel);
        }
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
          set(ref(this.db, `sessions/${this.sessionId()}/gameState/chaosMarketValue`), 0);
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

  initTmiClient(channel: string) {
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

  injectChaosFromTwitch(amount: number) {
    if (!this.sessionId()) return;
    get(ref(this.db, `sessions/${this.sessionId()}/gameState/chaosMarketValue`)).then(snapshot => {
      const current = snapshot.val() || 0;
      set(ref(this.db, `sessions/${this.sessionId()}/gameState/chaosMarketValue`), current + amount);
    });
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
    const db = getDatabase();
    set(ref(db, `sessions/${this.sessionId()}/characters/${pid}/x`), pos.x);
    set(ref(db, `sessions/${this.sessionId()}/characters/${pid}/y`), pos.y);
  }
  
  playerAction(action: string) {
    if (!this.sessionId() || !this.activePlayerId()) return;
    const db = getDatabase();
    push(ref(db, `sessions/${this.sessionId()}/rolls`), {
       player: this.getPlayerName(),
       result: `Executed action: ${action.toUpperCase()}`,
       timestamp: Date.now()
    });
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
