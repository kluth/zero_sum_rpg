import { Component, OnInit, signal, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as tmi from 'tmi.js';
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
      <h2 class="header-brutalist text-neon-blue" style="font-size: 48px; text-shadow: 0 0 20px #00F0FF; margin-bottom: 50px;">ZERO SUM RPG</h2>
      
      <input class="cyber-input" type="text" placeholder="ENTER SESSION PIN" [value]="sessionPinInput()" (input)="sessionPinInput.set($any($event.target).value)" style="width: 100%; max-width: 300px; padding: 15px; font-size: 24px; background: rgba(0,0,0,0.8); border: 2px solid #00F0FF; color: #00F0FF; text-align: center; margin-bottom: 20px; font-family: 'JetBrains Mono', monospace; text-transform: uppercase;">
      <input class="cyber-input" type="text" placeholder="TWITCH CHANNEL (OPTIONAL)" [value]="twitchChannelInput()" (input)="twitchChannelInput.set($any($event.target).value)" style="width: 100%; max-width: 300px; padding: 15px; font-size: 16px; background: rgba(0,0,0,0.8); border: 2px solid #39FF14; color: #39FF14; text-align: center; margin-bottom: 40px; font-family: 'JetBrains Mono', monospace;">
      
      <div style="display: flex; gap: 20px; flex-wrap: wrap; justify-content: center;">
        <button class="cyber-button" (click)="joinSession('spectator')">SPECTATE</button>
        <button class="cyber-button" style="border-color: #FF003C; color: #FF003C; background: rgba(255,0,60,0.1);" (click)="joinSession('gm')">GM OVERRIDE</button>
        <button class="cyber-button" style="border-color: #FFB000; color: #FFB000; background: rgba(255,176,0,0.1);" (click)="joinSession('billboard')">CORPORATE BILLBOARD</button>
        <button class="cyber-button" style="border-color: #39FF14; color: #39FF14; background: rgba(57,255,20,0.1);" (click)="joinSession('netrunner')">NETRUNNER SHELL</button>
      </div>

      <div style="margin-top: 30px; font-size: 14px; color: gray;">PROTAGONIST UPLINKS</div>
      <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px;">
        <button *ngFor="let p of protagonistList" class="cyber-button" style="border-color: #00FF00; color: #00FF00" (click)="joinSession('player', p.id)">{{p.name}} ({{p.role}})</button>
      </div>
    </div>

    <!-- MAIN DASHBOARD -->
    <div *ngIf="sessionId()" style="padding: 20px; height: 100vh; box-sizing: border-box; display: flex; flex-direction: column;">
      
      <!-- Pulsating Alert Bar -->
      <div *ngIf="heatLevel() >= 8 || recentTrauma()" class="pulsating-alert-bar header-brutalist chromatic" style="color: white; padding: 15px; font-size: 28px; text-align: center; border: 4px solid #FFFFFF; margin-bottom: 15px;">
        ⚠️ CRITICAL ALERT: {{ heatLevel() >= 8 ? 'HIGH HEAT LEVEL DETECTED (' + heatLevel() + '/10). ' : '' }} {{ recentTrauma() ? 'LIFE SUPPORT SYSTEM FAILURE: ' + recentTrauma().civilian : '' }}
      </div>

      @defer (when isGmMode()) {
        <!-- GM Map Builder Logic here -->
        <header class="glass-panel gm-panel" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h1 class="header-brutalist" style="margin: 0; font-size: 32px;">ZERO SUM <span class="text-neon-red">GM OVERRIDE</span></h1>
          <div class="data-mono" style="font-size: 18px; color: gray;">SESSION: <strong style="color: white; font-size: 24px;">{{ sessionId() }}</strong></div>
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

                 <button class="cyber-button" style="width: 100%; border-color: #00E5FF; color: #00E5FF;" (click)="generateProceduralFacility()">GENERATE PROCEDURAL FACILITY</button>
                 <p *ngIf="wfcError()" style="color: #39FF14; font-size: 12px; margin-top: 5px;">{{ wfcError() }}</p>

                 <div style="margin-top: 20px; border-top: 1px dashed gray; padding-top: 10px;">
                    <h3 class="text-neon-red">Global Heat Level</h3>
                    <button class="cyber-button" (click)="updateHeat(-1)">-</button>
                    <span style="font-size: 24px; color: #FF2A2A; font-weight: bold; margin: 0 15px;">{{ heatLevel() }}</span>
                    <button class="cyber-button" (click)="updateHeat(1)">+</button>
                 </div>
                 
                 <button class="cyber-button" style="border-color: #FF2A2A; color: #FF2A2A; width: 100%; margin-top: 20px;" (click)="publishMap()">SYNC GRID TO RTDB</button>
                 
                 <div style="border-top: 2px solid #FF003C; margin-top: 20px; padding-top: 15px;">
                    <h3 class="header-brutalist text-neon-red" style="font-size: 20px; border-bottom: 2px solid #FF003C; padding-bottom: 5px;">COMMAND DASHBOARD</h3>
                    <button class="cyber-button" style="border-color: #00F0FF; color: #00F0FF; width: 100%; margin-top: 10px;" (click)="deploySquad()">DEPLOY SQUAD TO GRID</button>
                    <button class="cyber-button" style="border-color: #FF003C; color: #FF003C; width: 100%; margin-top: 10px; background: rgba(255,0,60,0.1);" (click)="dealDamageToSquad()">DEAL 20 HP DAMAGE TO SQUAD</button>
                    <button class="cyber-button" style="border-color: #FF00FF; color: #FF00FF; width: 100%; margin-top: 10px; background: rgba(255,0,255,0.1);" (click)="inflictStressToSquad()">INFLICT CYBERPSYCHOSIS (+20 STRESS)</button>
                    <button class="cyber-button" style="border-color: #FFFF00; color: #FFFF00; width: 100%; margin-top: 10px; background: rgba(255,255,0,0.1);" (click)="spawnTraumaEvent()">LOG TRAUMA CASUALTY</button>
                 </div>
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
        <div class="billboard-container" [ngClass]="{'alarm-mode': heatLevel() >= 8 || recentTrauma()}" style="height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; position: relative; overflow: hidden; padding: 20px;">
            <div *ngIf="heatLevel() >= 8 || recentTrauma()" style="position: absolute; top:0; left:0; width:100%; height:100%; background: radial-gradient(circle, transparent 20%, rgba(255,0,60,0.5) 100%); pointer-events:none;"></div>
            
            <h1 class="header-brutalist chromatic" [style.color]="heatLevel() >= 8 ? '#FF003C' : '#00F0FF'" style="font-size: 140px; margin: 0; animation: blink 2s infinite; text-transform: uppercase;">GLOBAL HEAT: {{ heatLevel() }}</h1>
            
            <h2 class="header-brutalist" *ngIf="recentTrauma()" style="color: #FF003C; font-size: 80px; animation: blink 0.5s infinite; text-align: center; background: rgba(255,0,60,0.1); padding: 30px; border: 8px solid #FF003C; text-shadow: 2px 2px 0px white; z-index: 10;">
                LIFE SUPPORT REDIRECTED.<br/>CASUALTY: {{ recentTrauma().civilian }}
            </h2>
            
            <div *ngIf="!recentTrauma()" style="display: flex; gap: 40px; margin-top: 40px; width: 90%; justify-content: space-around; max-height: 70%; box-sizing: border-box;">
               <!-- OPERATIVE STATUS METRICS -->
               <div class="glass-panel" style="flex: 1; border: 4px solid #39FF14; background: rgba(57,255,20,0.05); padding: 30px;">
                  <h3 class="header-brutalist text-acid-green" style="font-size: 36px; border-bottom: 2px solid #39FF14; margin-bottom: 20px;">OPERATIVE STATUS</h3>
                  
                  <div style="margin-bottom: 20px;">
                     <div style="color: #39FF14; font-size: 20px; font-weight: bold;">SQUAD VITALITY (HP)</div>
                     <div class="data-mono" style="font-size: 48px; color: #FFFFFF;">{{ squadHpAvg() }}%</div>
                     <div style="font-size: 12px; color: gray;">Measures the average physical integrity of active operatives.</div>
                  </div>
                  
                  <div style="margin-bottom: 20px;">
                     <div style="color: #FFB000; font-size: 20px; font-weight: bold;">ALLOSTATIC LOAD (STRESS)</div>
                     <div class="data-mono" style="font-size: 48px; color: #FFFFFF;">{{ squadStressAvg() }}%</div>
                     <div style="font-size: 12px; color: gray;">Average psychological deterioration. High levels lead to cyberpsychosis.</div>
                  </div>
                  
                  <div>
                     <div style="color: #FF003C; font-size: 20px; font-weight: bold;">CONFIRMED CASUALTIES</div>
                     <div class="data-mono" style="font-size: 48px; color: #FFFFFF;">{{ traumaCount() }}</div>
                     <div style="font-size: 12px; color: gray;">Collateral civilian damage logged by corporate oversight.</div>
                  </div>
               </div>
               
               <!-- TWITCH CHAOS INTERACTION INSTRUCTIONS -->
               <div class="glass-panel" style="flex: 1; border: 4px solid #00F0FF; background: rgba(0,240,255,0.05); padding: 30px; display: flex; flex-direction: column; justify-content: center;">
                  <h3 class="header-brutalist text-neon-blue" style="font-size: 36px; border-bottom: 2px solid #00F0FF; margin-bottom: 20px;">SPECTATOR OVERRIDE</h3>
                  
                  <div style="font-size: 18px; color: #00F0FF; margin-bottom: 30px; font-weight: bold;">
                    YOU ARE AUTHORIZED TO INFLUENCE THE OPERATION. USE TWITCH CHAT TO INJECT CHAOS INTO THE MARKET. THE GAME MASTER WILL USE MARKET FUNDS AGAINST THE SQUAD.
                  </div>
                  
                  <div style="display: flex; flex-direction: column; gap: 20px;">
                     <div style="background: rgba(0,240,255,0.1); padding: 15px; border-left: 5px solid #00F0FF;">
                        <span style="font-size: 24px; font-weight: bold; color: white;">TYPE <span style="color: #00F0FF;">!chaos</span> IN CHAT</span><br/>
                        <span style="font-size: 16px; color: #00F0FF;">Adds $10 to the Chaos Market. FREE.</span>
                     </div>
                     <div style="background: rgba(255,0,255,0.1); padding: 15px; border-left: 5px solid #FF00FF;">
                        <span style="font-size: 24px; font-weight: bold; color: white;">CHEER BITS</span><br/>
                        <span style="font-size: 16px; color: #FF00FF;">Adds proportional Chaos to the Market.</span>
                     </div>
                  </div>
                  
                  <h3 class="header-brutalist text-neon-blue" style="text-align: center; font-size: 48px; margin-top: 30px; border: 2px dashed #00F0FF; padding: 20px;">MARKET: $ {{ chaosMarketValue() }}</h3>
               </div>
            </div>
        </div>
      }
      
      @defer (when isNetrunnerMode()) {
        <!-- NETRUNNER ICE TERMINAL -->
        <div class="terminal glass-panel" style="background: rgba(0,255,0,0.05); color: #39FF14; font-family: 'JetBrains Mono', monospace; height: 100%; border: 3px solid #39FF14;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #39FF14; padding-bottom: 10px;">
            <h2 class="header-brutalist text-acid-green" style="margin: 0; font-size: 32px;">INFOSEC MAINFRAME // AI-DRIVEN ICE</h2>
            <button class="cyber-button" style="border-color: #39FF14; color: #39FF14; padding: 5px 10px; margin: 0; font-size: 14px;" (click)="connectBleBeacon()">[BLE AIR-GAP] CONNECT BEACON</button>
          </div>
          <div style="height: 80%; overflow-y: auto; margin-top: 10px; margin-bottom: 20px; font-size: 18px; line-height: 1.5;" id="terminalOutput" class="data-mono">
            <div *ngFor="let log of terminalLogs()">> {{ log }}</div>
          </div>
          <div style="display: flex; align-items: center; background: rgba(57,255,20,0.1); padding: 10px; border: 2px solid #39FF14;">
            <span style="font-size: 24px; margin-right: 10px; color: #39FF14;">$</span>
            <input type="text" [(ngModel)]="terminalCommand" (keyup.enter)="executeIceCommand()" style="background: transparent; color: #39FF14; border: none; outline: none; width: 100%; font-size: 24px; font-family: 'JetBrains Mono', monospace;" placeholder="grep the mainframe..." autofocus />
          </div>
        </div>
      }
      
      @defer (when isSpectatorMode()) {
        <div class="glass-panel" style="flex: 1; display: flex; flex-direction: column; overflow: hidden; border-color: #00F0FF;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 4px solid #00F0FF; padding-bottom: 15px; margin-bottom: 15px;">
              <h2 class="header-brutalist text-neon-blue" style="font-size: 36px; margin: 0;">SPECTATOR UPLINK // TWITCH</h2>
              <div style="display: flex; gap: 20px; align-items: center;">
                <button class="cyber-button" style="border-color: #39FF14; color: #39FF14; font-size: 16px; margin-top: 0; padding: 10px 20px; background: rgba(57,255,20,0.1);" (click)="showWebcamPanel.set(!showWebcamPanel())">TOGGLE WEBCAMS</button>
                <div class="data-mono" style="color: #00F0FF; font-size: 28px; font-weight: bold; background: rgba(0,240,255,0.1); padding: 5px 15px; border: 2px solid #00F0FF;">MARKET: $ {{ chaosMarketValue() }}</div>
                <div class="data-mono" style="color: #FF003C; font-size: 28px; font-weight: bold; background: rgba(255,0,60,0.1); padding: 5px 15px; border: 2px solid #FF003C;">HEAT: {{ heatLevel() }}</div>
              </div>
            </div>
            
            <div [ngStyle]="{'grid-template-columns': showWebcamPanel() ? '300px 350px 1fr 350px' : '350px 1fr 350px'}" style="display: grid; gap: 20px; flex: 1; overflow: hidden;">
              <!-- Webcams (Optional) -->
              <div *ngIf="showWebcamPanel()" class="glass-panel webcam-pane" style="display: flex; flex-direction: column; overflow-y: auto; padding: 15px; border-color: #39FF14;">
                <h3 class="header-brutalist text-acid-green" style="margin-top: 0; font-size: 20px; border-bottom: 2px solid #39FF14; padding-bottom: 5px;">WEBCAM FEEDS</h3>
                <div style="display: flex; flex-direction: column; gap: 15px; margin-top: 10px;">
                  <div *ngFor="let key of getCharacterKeys()" style="aspect-ratio: 16/9; border: 2px dashed #39FF14; background: rgba(57,255,20,0.05); position: relative; display: flex; justify-content: center; align-items: center;">
                    <div style="color: white; font-family: 'JetBrains Mono', monospace; font-size: 12px; position: absolute; top: 5px; left: 5px; background: black; padding: 2px 5px; border: 1px solid #39FF14; z-index: 2;">{{ gameState().characters[key].name }}</div>
                    <div style="color: #39FF14; font-family: 'JetBrains Mono', monospace; font-size: 14px; opacity: 0.5;">[ OBS CAPTURE ]</div>
                  </div>
                </div>
              </div>
              <!-- Left column: Scrolling logs panel -->
              <div class="glass-panel left-pane" style="display: flex; flex-direction: column; overflow: hidden; padding: 15px;">
                <h3 class="header-brutalist text-neon-blue" style="margin-top: 0; font-size: 20px; border-bottom: 2px solid #00F0FF; padding-bottom: 5px;">LIVE FEED & DONATIONS</h3>
                <div style="flex: 1; overflow-y: auto; font-family: 'JetBrains Mono', monospace; font-size: 14px; color: #39FF14; margin-top: 10px;" class="scrolling-logs">
                  <div *ngFor="let roll of gameState().recentRolls || []" style="border-bottom: 1px dashed rgba(57,255,20,0.3); padding: 8px 0;">
                    [{{ roll.timestamp | date:'HH:mm:ss' }}] ROLL: {{ roll.player }} rolled D20 -> {{ roll.result }}
                  </div>
                  <div *ngIf="chaosMarketValue() > 0" style="color: #FF00FF; padding: 8px 0; border-bottom: 1px dashed rgba(255,0,255,0.3); font-weight: bold; font-size: 16px;">
                    [TWITCH] FUNDS INJECTED! Market: $ {{ chaosMarketValue() }}
                  </div>
                </div>
              </div>
              
              <!-- Center column: PixiJS map canvas -->
              <div style="position: relative; display: flex; flex-direction: column; overflow: hidden; border: 3px solid #00F0FF; box-shadow: inset 0 0 50px rgba(0,240,255,0.1);">
                <div style="flex: 1; position: relative;">
                  <app-pixi-map [mode]="'spectator'" [characters]="gameState().characters || {}"></app-pixi-map>
                </div>
              </div>
              
              <!-- Right column: Squad status cards and Clocks -->
              <div class="glass-panel right-pane" style="display: flex; flex-direction: column; overflow-y: auto; padding: 15px;">
                <h3 class="header-brutalist text-neon-blue" style="margin-top: 0; font-size: 20px; border-bottom: 2px solid #00F0FF; padding-bottom: 5px;">THREAT CLOCKS</h3>
                <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 30px; margin-top: 10px;">
                  <app-progress-clock *ngFor="let clock of getPublicClocks()" 
                      [name]="clock.name" [segments]="clock.segments" [filled]="clock.filled" [color]="clock.color">
                  </app-progress-clock>
                  <div class="data-mono" *ngIf="getPublicClocks().length === 0" style="color: gray; font-style: italic;">SYSTEM SECURE.</div>
                </div>
                
                <h3 class="header-brutalist text-neon-blue" style="margin-top: 0; font-size: 20px; border-bottom: 2px solid #00F0FF; padding-bottom: 5px;">SQUAD STATUS</h3>
                <div style="display: flex; flex-direction: column; gap: 15px; margin-top: 10px;">
                  <div *ngFor="let key of getCharacterKeys()" class="squad-card" [ngStyle]="{'background': (gameState().characters[key].stats?.hp_current || 100) <= 0 ? 'rgba(255,0,60,0.1)' : 'rgba(0,240,255,0.05)'}" style="border: 2px solid #00F0FF; padding: 10px; font-family: 'JetBrains Mono', monospace; font-size: 14px; position: relative; overflow: hidden;">
                    
                    <div *ngIf="(gameState().characters[key].stats?.hp_current || 100) <= 0" style="position: absolute; top:0; left:0; width:100%; height:100%; background: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,0,60,0.2) 10px, rgba(255,0,60,0.2) 20px); pointer-events: none;"></div>
                    <div [style.color]="(gameState().characters[key].stats?.hp_current || 100) <= 0 ? 'gray' : '#39FF14'" [style.text-decoration]="(gameState().characters[key].stats?.hp_current || 100) <= 0 ? 'line-through #FF003C 3px' : 'none'" style="font-weight: 900; font-size: 16px; border-bottom: 2px solid #00F0FF; padding-bottom: 5px; margin-bottom: 8px;">
                      {{ gameState().characters[key].name }}
                    </div>
                    <div style="color: gray; margin-bottom: 5px; font-size: 12px;">ROLE: {{ gameState().characters[key].role }}</div>
                    <div style="display: flex; justify-content: space-between; font-weight: bold;">
                      <span [style.color]="(gameState().characters[key].stats?.hp_current || 100) < 30 ? '#FF003C' : '#FFFFFF'">HP: {{ gameState().characters[key].stats?.hp_current || 100 }}%</span>
                      <span [style.color]="(gameState().characters[key].stats?.stealth_total || 0) >= 50 ? '#39FF14' : '#FF003C'">STL: {{ gameState().characters[key].stats?.stealth_total || 0 }}</span>
                      <span [style.color]="(gameState().characters[key].stats?.stress_current || 0) >= 70 ? '#FF003C' : '#FFFFFF'">STR: {{ gameState().characters[key].stats?.stress_current || 0 }}</span>
                    </div>
                  </div>
                  <div *ngIf="getCharacterKeys().length === 0" style="color: gray; font-style: italic;">
                    NO ACTIVE SIGNALS.
                  </div>
                </div>
              </div>
            </div>
        </div>
      }

      @defer (when isPlayerMode()) {
        <div class="glass-panel" style="flex: 1; display: flex; flex-direction: column; overflow: hidden; border-color: #39FF14; background: rgba(57,255,20,0.02);">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 4px solid #39FF14; padding-bottom: 10px; margin-bottom: 15px;">
              <h2 class="header-brutalist text-acid-green" style="font-size: 32px; margin: 0;">UPLINK // {{ getPlayerName() }}</h2>
              <div class="data-mono" style="color: #39FF14; font-size: 20px; border: 2px solid #39FF14; padding: 5px 10px; background: rgba(57,255,20,0.1);">ROLE: {{ getPlayerRole() }}</div>
              
              <button class="cyber-button" style="border: 4px solid #FFB000; color: #FFB000; font-size: 16px; margin: 0; padding: 10px 20px; background: repeating-linear-gradient(45deg, rgba(255,176,0,0.1), rgba(255,176,0,0.1) 10px, transparent 10px, transparent 20px);" (click)="triggerEmergencyHeal()">⚠️ [ZERO SUM] EMERGENCY HEAL ⚠️</button>
              
              <div class="data-mono" style="color: #FF003C; font-size: 20px; font-weight: bold; border: 2px solid #FF003C; padding: 5px 10px; background: rgba(255,0,60,0.1);">HEAT: {{ heatLevel() }}</div>
            </div>
            
            <div style="flex: 1; position: relative; border: 3px solid #39FF14; box-shadow: inset 0 0 50px rgba(57,255,20,0.1);">
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
  chaosMarketValue = computed(() => this.gameState()?.chaosMarketValue || 0);

  squadHpAvg = computed(() => {
    const chars = this.gameState()?.characters || {};
    const keys = Object.keys(chars);
    if (keys.length === 0) return 100;
    const total = keys.reduce((acc, key) => acc + (chars[key].stats?.hp_current || 0), 0);
    return Math.floor(total / keys.length);
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

  private db: any;
  private app: any;
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

  generateProceduralFacility() {
    this.wfcError.set("INITIALIZING PROCEDURAL GENERATION...");
    
    // Clean slate
    this.gridStore.setState({ dimensions: { width: 50, height: 30 }, grid: {}, rooms: {} });
    
    // Real Procedural Generation Logic (BSP / Random Carve)
    const newRooms: Record<string, any> = {};
    for (let i = 0; i < 6; i++) {
        const roomId = `room_${Math.random().toString(36).substr(2, 6)}`;
        const w = Math.floor(Math.random() * 6) + 4;
        const h = Math.floor(Math.random() * 6) + 4;
        const x = Math.floor(Math.random() * (48 - w)) + 1;
        const y = Math.floor(Math.random() * (28 - h)) + 1;
        
        newRooms[roomId] = {
            tag: `Sector ${i+1}`,
            bounds: { x, y, w, h },
            color: i === 0 ? '#FF003C' : '#39FF14',
            metadata: { threat: i === 0 ? 'critical' : 'medium', vfx: i === 0 ? 'flash_red_alert' : 'none' }
        };
        
        // Add walls around it
        for (let r_x = x; r_x < x + w; r_x++) {
            for (let r_y = y; r_y < y + h; r_y++) {
               if (r_x === x || r_x === x + w - 1 || r_y === y || r_y === y + h - 1) {
                  // Poke a random hole for a door
                  if (Math.random() > 0.85) {
                     this.gridStore.updateCell(r_x, r_y, { type: 'door_locked', room_id: roomId });
                  } else {
                     this.gridStore.updateCell(r_x, r_y, { type: 'structure_wall', room_id: roomId });
                  }
               }
            }
        }
    }
    
    Object.keys(newRooms).forEach(k => this.gridStore.updateRoom(k, newRooms[k]));
    
    this.wfcError.set("FACILITY GENERATED SUCCESSFULLY. SYNC REQUIRED.");
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

  joinSession(mode: string, playerId?: string) {
    const pin = this.sessionPinInput().toUpperCase();
    if (!pin || pin.length < 4) return;
    
    let url = `/?session=${pin}&mode=${mode}`;
    if (playerId) url += `&player=${playerId}`;
    
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
     
     // Local Netrunner ICE processor
     if (cmd === 'help') {
        this.terminalLogs.update(logs => [
           ...logs, 
           'LOCAL ICE TERMINAL V2.4', 
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
