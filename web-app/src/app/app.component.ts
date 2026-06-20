import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { io, Socket } from 'socket.io-client';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 20px;">
      <header class="glass-panel" style="display: flex; justify-content: space-between; align-items: center;">
        <h1 style="margin: 0;">ZERO SUM <span class="text-neon-red">SPECTATOR VIEW</span></h1>
        <div style="font-size: 14px; color: gray;">TWITCH INTEGRATION ACTIVE 🔴</div>
      </header>

      <div class="flex-container">
        <!-- Live Rolls -->
        <div class="flex-item glass-panel">
          <h2>Live Dice Rolls</h2>
          <div *ngIf="gameState?.recentRolls?.length === 0" style="color: gray;">No rolls yet.</div>
          <div *ngFor="let roll of gameState?.recentRolls" class="roll-card">
            <strong>{{ roll.player }}</strong> rolled a 
            <span class="text-neon-red" style="font-size: 1.5em; font-weight: bold;">{{ roll.result }}</span>
          </div>
        </div>

        <!-- Tactical Map -->
        <div class="flex-item glass-panel" style="flex: 2;">
          <h2>Tactical Map</h2>
          <div *ngIf="!gameState?.map" style="color: gray;">No map generated for this operation.</div>
          
          <div *ngIf="gameState?.map">
            <h3 class="text-neon-blue" style="margin-bottom: 5px;">{{ gameState.map.archetype }}</h3>
            <p style="color: #FF2A2A; margin-top: 0;">Layout: {{ gameState.map.layoutStructure }}</p>
            
            <div *ngFor="let room of gameState.map.rooms" class="map-room" [class.objective]="room.isObjective">
              <span [ngStyle]="{'color': room.isObjective ? '#FF2A2A' : '#00E5FF', 'font-weight': 'bold', 'margin-right': '10px'}">
                [0{{ room.id }}]
              </span>
              <strong>{{ room.name }}</strong>
              <div *ngIf="room.complication !== 'Clear'" style="color: #FF2A2A; font-size: 0.8em; margin-top: 5px;">
                WARN: {{ room.complication }}
              </div>
              <div *ngIf="room.complication === 'Clear'" style="color: gray; font-size: 0.8em; margin-top: 5px;">
                STATUS: CLEAR
              </div>
            </div>
          </div>
        </div>

        <!-- Squad Status -->
        <div class="flex-item glass-panel">
          <h2>Squad Status</h2>
          <div *ngIf="!gameState?.characters || getCharacterKeys().length === 0" style="color: gray;">No operators online.</div>
          <div *ngFor="let key of getCharacterKeys()" style="margin-bottom: 15px;">
            <strong class="text-neon-blue">{{ gameState.characters[key].name }}</strong>
            <div style="font-size: 12px; color: gray;">{{ gameState.characters[key].role }}</div>
            
            <div style="margin-top: 8px;">
              <div style="display: flex; justify-content: space-between; font-size: 12px;">
                <span>HP</span>
                <span class="text-neon-blue">{{ gameState.characters[key].hp }} / 100</span>
              </div>
              <div style="background: #333; height: 4px; border-radius: 2px;">
                <div [style.width.%]="gameState.characters[key].hp" style="background: #00E5FF; height: 100%;"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AppComponent implements OnInit {
  private socket!: Socket;
  gameState: any = { recentRolls: [], characters: {}, map: null };

  ngOnInit() {
    this.socket = io('http://localhost:3000');
    
    this.socket.on('stateSync', (state: any) => {
      this.gameState = state;
    });
  }

  getCharacterKeys() {
    return this.gameState && this.gameState.characters ? Object.keys(this.gameState.characters) : [];
  }
}
