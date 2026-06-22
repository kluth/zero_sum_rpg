import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, inject, effect, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as PIXI from 'pixi.js';
import { Viewport } from 'pixi-viewport';
import { GridStore } from './grid.store';

@Component({
  selector: 'app-pixi-map',
  standalone: true,
  imports: [CommonModule],
  template: `<div #pixiContainer style="width: 100%; height: 100%; overflow: hidden; border: 1px solid #00E5FF; border-radius: 4px;"></div>`
})
export class PixiMapComponent implements AfterViewInit, OnDestroy {
  @Input() characters: Record<string, any> = {};
  @Input() activePlayerId: string | null = null;
  @Input() mode: 'gm' | 'spectator' | 'player' | 'billboard' | 'netrunner' = 'gm';
  @ViewChild('pixiContainer') pixiContainer!: ElementRef<HTMLDivElement>;
  @Output() cellClicked = new EventEmitter<{x: number, y: number}>();
  @Output() roomClicked = new EventEmitter<string>();

  private app!: PIXI.Application;
  private viewport!: Viewport;
  private gridStore = inject(GridStore);
  
  private sprites: Record<string, PIXI.Sprite | PIXI.Graphics> = {};
  private roomGraphics: Record<string, PIXI.Graphics> = {};
  private charGraphics: Record<string, PIXI.Graphics> = {};

  constructor() {
    effect(() => {
      const grid = this.gridStore.grid();
      const rooms = this.gridStore.rooms();
      const dim = this.gridStore.dimensions();
      // To react to character changes, we just read this.characters in renderMap.
      // But we need a signal for characters. Wait, Angular @Input is not a signal by default unless we use input().
      // For now, we will rely on ngOnChanges or just let the effect trigger when grid/rooms change.
      // Actually we should just call renderMap.
      this.renderMap(dim, grid, rooms);
    });
  }

  ngOnChanges() {
     const dim = this.gridStore.dimensions();
     this.renderMap(dim, this.gridStore.grid(), this.gridStore.rooms());
  }

  async ngAfterViewInit() {
    this.app = new PIXI.Application();
    await this.app.init({
      resizeTo: this.pixiContainer.nativeElement,
      backgroundColor: 0x050505,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    this.pixiContainer.nativeElement.appendChild(this.app.canvas as any);

    this.viewport = new Viewport({
      screenWidth: this.pixiContainer.nativeElement.clientWidth,
      screenHeight: this.pixiContainer.nativeElement.clientHeight,
      worldWidth: 50 * 32,
      worldHeight: 30 * 32,
      events: this.app.renderer.events
    });

    this.app.stage.addChild(this.viewport);
    this.viewport.drag().pinch().wheel().decelerate();

    this.viewport.on('clicked', (e) => {
      if (this.mode !== 'gm') return;
      const worldPos = this.viewport.toWorld(e.screen);
      const x = Math.floor(worldPos.x / 32);
      const y = Math.floor(worldPos.y / 32);
      if (x >= 0 && y >= 0 && x < 50 && y < 30) {
        const key = `${x},${y}`;
        const cell = this.gridStore.grid()[key];
        if (cell && cell.room_id) {
          this.roomClicked.emit(cell.room_id);
        } else {
          this.cellClicked.emit({x, y});
        }
      }
    });

    // Start a ticker to animate things
    this.app.ticker.add((ticker) => {
        // Red alert flash
        Object.keys(this.roomGraphics).forEach(roomId => {
            const room = this.gridStore.rooms()[roomId];
            if (room?.metadata?.vfx === 'flash_red_alert') {
                const g = this.roomGraphics[roomId];
                if (g) g.alpha = 0.5 + Math.sin(Date.now() / 150) * 0.3;
            }
        });
    });
  }

  private renderMap(dim: any, grid: any, rooms: any) {
    if (!this.viewport || !dim) return;

    // Clear old graphics
    Object.values(this.sprites).forEach(s => this.viewport.removeChild(s));
    Object.values(this.roomGraphics).forEach(g => this.viewport.removeChild(g));
    Object.values(this.charGraphics).forEach(g => this.viewport.removeChild(g));
    this.sprites = {};
    this.roomGraphics = {};
    this.charGraphics = {};

    let myChar: any = null;
    if (this.mode === 'player' && this.activePlayerId && this.characters) {
       myChar = this.characters[this.activePlayerId];
    }

    // 1. Draw base grid points
    const baseGrid = new PIXI.Graphics();
    for(let x=0; x<dim.width; x++){
      for(let y=0; y<dim.height; y++){
        baseGrid.rect(x * 32, y * 32, 32, 32);
        baseGrid.fill({ color: 0x111111 });
        baseGrid.stroke({ color: 0x222222, width: 1 });
      }
    }
    this.viewport.addChild(baseGrid);
    this.roomGraphics['base'] = baseGrid;

    // 2. Draw Rooms
    for (const [roomId, room] of Object.entries(rooms) as [string, any][]) {
      let isVisible = true;
      let isMemory = false;

      if (this.mode === 'spectator') {
         const isRevealed = room.metadata?.revealedTo && Object.values(room.metadata.revealedTo).some(v => v === true);
         if (!isRevealed) isVisible = false;
      } else if (this.mode === 'player' && myChar) {
         // Determine if room is in FoW
         const cx = room.bounds.x + room.bounds.w/2;
         const cy = room.bounds.y + room.bounds.h/2;
         const dist = Math.sqrt(Math.pow(cx - myChar.x, 2) + Math.pow(cy - myChar.y, 2));
         if (dist > (myChar.fowRadius || 6)) {
            // Out of active FoW. If it was revealed previously, show it as memory
            const isRevealedToMe = room.metadata?.revealedTo && room.metadata.revealedTo[this.activePlayerId!];
            if (isRevealedToMe) {
               isMemory = true;
            } else {
               isVisible = false;
            }
         }
      }

      if (!isVisible) continue;

      const g = new PIXI.Graphics();
      const bounds = room.bounds;
      const isCritical = room.metadata?.threat === 'critical';
      const color = isMemory ? 0x555555 : (isCritical ? 0xff0000 : 0x00E5FF);
      let alpha = isMemory ? 0.2 : (isCritical ? 0.3 : 0.1);

      g.rect(bounds.x * 32, bounds.y * 32, bounds.w * 32, bounds.h * 32);
      g.fill({ color, alpha });
      g.stroke({ color, width: 2, alpha: isMemory ? 0.3 : 1 });
      
      this.viewport.addChild(g);
      this.roomGraphics[roomId] = g;
      
      if (!isMemory) {
          const text = new PIXI.Text({ text: room.tag || roomId, style: { fontSize: 14, fill: color, fontFamily: 'monospace' }});
          text.x = bounds.x * 32 + 5;
          text.y = bounds.y * 32 + 5;
          g.addChild(text);
      }
    }

    // 3. Draw Grid cells & walls
    for (const [key, cell] of Object.entries(grid) as [string, any][]) {
      const [x, y] = key.split(',').map(Number);
      
      let isVisible = true;
      if (this.mode === 'player' && myChar) {
         const dist = Math.sqrt(Math.pow(x - myChar.x, 2) + Math.pow(y - myChar.y, 2));
         if (dist > (myChar.fowRadius || 6)) {
             const parentRoom = cell.room_id ? rooms[cell.room_id] : null;
             const isRevealed = parentRoom?.metadata?.revealedTo && parentRoom.metadata.revealedTo[this.activePlayerId!];
             if (!isRevealed) isVisible = false;
         }
      } else if (this.mode === 'spectator' && cell.room_id) {
         const parentRoom = rooms[cell.room_id];
         const isRevealed = parentRoom?.metadata?.revealedTo && Object.values(parentRoom.metadata.revealedTo).some(v => v === true);
         if (!isRevealed) isVisible = false;
      }

      if (!isVisible) continue;

      if (cell.type === 'structure_wall') {
        const wall = new PIXI.Graphics();
        wall.rect(x * 32, y * 32, 32, 32);
        wall.fill({ color: 0x555555 });
        this.viewport.addChild(wall);
        this.sprites[key] = wall;
      }
    }

    // 4. Draw Characters
    if (this.characters) {
       for (const [charId, char] of Object.entries(this.characters) as [string, any][]) {
          // FoW check
          let isVisible = true;
          if (this.mode === 'player' && myChar) {
              const dist = Math.sqrt(Math.pow(char.x - myChar.x, 2) + Math.pow(char.y - myChar.y, 2));
              if (dist > (myChar.fowRadius || 6)) isVisible = false;
          } else if (this.mode === 'spectator') {
              // Spectator sees characters only if they are in a revealed room or in the open
              let inRevealedRoom = false;
              for(const room of Object.values(rooms) as any[]) {
                 if (char.x >= room.bounds.x && char.x < room.bounds.x + room.bounds.w &&
                     char.y >= room.bounds.y && char.y < room.bounds.y + room.bounds.h) {
                     if (room.metadata?.revealedTo && Object.values(room.metadata.revealedTo).some(v => v === true)) {
                         inRevealedRoom = true; break;
                     }
                 }
              }
              if (!inRevealedRoom) isVisible = false;
          }

          if (!isVisible && charId !== this.activePlayerId) continue;

          const cg = new PIXI.Graphics();
          const isMe = charId === this.activePlayerId;
          const color = isMe ? 0x00FF00 : 0xFF2A2A;
          
          cg.circle(char.x * 32 + 16, char.y * 32 + 16, 12);
          cg.fill({ color });
          cg.stroke({ color: 0xFFFFFF, width: isMe ? 2 : 0 });
          this.viewport.addChild(cg);
          this.charGraphics[charId] = cg;

          const label = new PIXI.Text({ text: char.name, style: { fontSize: 10, fill: 0xFFFFFF } });
          label.x = char.x * 32;
          label.y = char.y * 32 - 15;
          this.viewport.addChild(label);
          this.charGraphics[charId + '_label'] = label;
       }
    }
  }

  ngOnDestroy() {
    if (this.app) {
      this.app.destroy(true, { children: true, texture: true });
    }
  }
}
