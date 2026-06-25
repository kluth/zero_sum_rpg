import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, inject, effect, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as PIXI from 'pixi.js';
import { Viewport } from 'pixi-viewport';
import { GridStore } from './grid.store';

@Component({
  selector: 'app-pixi-map',
  standalone: true,
  imports: [CommonModule],
  template: `<div #pixiContainer style="width: 100%; height: 100%; overflow: hidden; border: 1px solid #1a1a1c; border-radius: 0px;"></div>`
})
export class PixiMapComponent implements AfterViewInit, OnDestroy {
  @Input() characters: Record<string, any> = {};
  @Input() sensoryData: any = {};
  @Input() activePlayerId: string | null = null;
  @Input() currentLevel: number = 1;
  @Input() mode: 'gm' | 'spectator' | 'player' | 'billboard' | 'netrunner' = 'gm';
  @Input() paintMode: string | null = null; // TileType
  @ViewChild('pixiContainer') pixiContainer!: ElementRef<HTMLDivElement>;
  @Output() cellClicked = new EventEmitter<{x: number, y: number}>();
  @Output() roomClicked = new EventEmitter<string>();
  @Output() cellPainted = new EventEmitter<{x: number, y: number, type: string}>();
  @Output() playerMoved = new EventEmitter<{x: number, y: number}>();

  private app!: PIXI.Application;
  private viewport!: Viewport;
  private gridStore = inject(GridStore);
  
  private staticLayer!: PIXI.Container;
  private roomLayer!: PIXI.Container;
  private dynamicLayer!: PIXI.Container;

  private cachedCells: Record<string, PIXI.Container> = {};
  private roomGraphics: Record<string, PIXI.Graphics> = {};
  private charGraphics: Record<string, PIXI.Graphics | PIXI.Text> = {};
  private acousticsSprites: Record<string, PIXI.Graphics> = {};

  private lastGridRef: any = null;
  private lastRoomsRef: any = null;
  private lastDimRef: any = null;
  private lastLevel: number = -1;

  constructor() {
    effect(() => {
      const grid = this.gridStore.grid();
      const rooms = this.gridStore.rooms();
      const dim = this.gridStore.dimensions();
      
      let staticChanged = false;
      if (grid !== this.lastGridRef || rooms !== this.lastRoomsRef || dim !== this.lastDimRef || this.currentLevel !== this.lastLevel) {
          staticChanged = true;
          this.lastGridRef = grid;
          this.lastRoomsRef = rooms;
          this.lastDimRef = dim;
          this.lastLevel = this.currentLevel;
      }
      
      if (staticChanged) {
          this.renderStaticMap(dim, grid, rooms);
      }
      this.renderDynamicEntities(dim, grid, rooms);
    });
  }

  ngOnChanges() {
     if (this.viewport) {
       if (this.paintMode) {
         this.viewport.plugins.pause('drag');
       } else {
         this.viewport.plugins.resume('drag');
       }
     }
     
     const dim = this.gridStore.dimensions();
     const grid = this.gridStore.grid();
     const rooms = this.gridStore.rooms();

     let staticChanged = false;
     if (this.currentLevel !== this.lastLevel) {
          staticChanged = true;
          this.lastLevel = this.currentLevel;
     }

     if (staticChanged) {
         this.renderStaticMap(dim, grid, rooms);
     }
     this.renderDynamicEntities(dim, grid, rooms);
  }

  private emitPaint(e: any) {
     if (!this.paintMode) return;
     const worldPos = this.viewport.toWorld(e.global);
     const x = Math.floor(worldPos.x / 32);
     const y = Math.floor(worldPos.y / 32);
     if (x >= 0 && y >= 0 && x < 50 && y < 30) {
        this.cellPainted.emit({x, y, type: this.paintMode});
     }
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

    this.staticLayer = new PIXI.Container();
    this.roomLayer = new PIXI.Container();
    this.dynamicLayer = new PIXI.Container();

    this.viewport.addChild(this.staticLayer);
    this.viewport.addChild(this.roomLayer);
    this.viewport.addChild(this.dynamicLayer);

    let isPainting = false;
    this.viewport.on('pointerdown', (e) => {
      if (this.mode === 'gm' && this.paintMode) {
        isPainting = true;
        this.emitPaint(e);
      }
    });
    this.viewport.on('pointermove', (e) => {
      if (isPainting && this.mode === 'gm' && this.paintMode) {
        this.emitPaint(e);
      }
    });
    this.viewport.on('pointerup', () => isPainting = false);
    this.viewport.on('pointerupoutside', () => isPainting = false);

    this.viewport.on('clicked', (e) => {
      const worldPos = this.viewport.toWorld(e.screen);
      if (this.mode === 'player') {
        const subX = worldPos.x / 32;
        const subY = worldPos.y / 32;
        this.playerMoved.emit({x: subX, y: subY});
        return;
      }
      if (this.mode !== 'gm' || this.paintMode) return;
      const x = Math.floor(worldPos.x / 32);
      const y = Math.floor(worldPos.y / 32);
      if (x >= 0 && y >= 0 && x < 50 && y < 30) {
        const key = `${x},${y},${this.currentLevel}`;
        const fallbackKey = `${x},${y}`;
        const cell = this.gridStore.grid()[key] || this.gridStore.grid()[fallbackKey];
        if (cell && cell.roomId) {
          this.roomClicked.emit(cell.roomId);
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

    // Hydrate the view if state arrived before initialization completed
    const dim = this.gridStore.dimensions();
    const grid = this.gridStore.grid();
    const rooms = this.gridStore.rooms();
    if (dim) {
       this.renderStaticMap(dim, grid, rooms);
       this.renderDynamicEntities(dim, grid, rooms);
    }
  }

  private hasLineOfSight(x0: number, y0: number, x1: number, y1: number, grid: any): boolean {
    let dx = Math.abs(x1 - x0);
    let dy = Math.abs(y1 - y0);
    let sx = (x0 < x1) ? 1 : -1;
    let sy = (y0 < y1) ? 1 : -1;
    let err = dx - dy;

    while (true) {
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) { err -= dy; x0 += sx; }
      if (e2 < dx) { err += dx; y0 += sy; }

      if (x0 === x1 && y0 === y1) break;
      const cell = grid[`${x0},${y0},${this.currentLevel}`] || grid[`${x0},${y0}`];
      if (cell && (cell.type === 'wall' || cell.type === 'door_locked' || cell.type === 'structure_wall')) {
        return false;
      }
    }
    return true;
  }

  private renderStaticMap(dim: any, grid: any, rooms: any) {
    if (!this.viewport || !dim || !this.staticLayer) return;

    // Clear existing static cells
    Object.values(this.cachedCells).forEach(c => {
        this.staticLayer.removeChild(c);
        c.destroy({children: true});
    });
    this.cachedCells = {};

    for (let x = 0; x < dim.width; x++) {
      for (let y = 0; y < dim.height; y++) {
         const key = `${x},${y},${this.currentLevel}`;
         const fallbackKey = `${x},${y}`;
         const cell = grid[key] || grid[fallbackKey];

         // We always create a container for the cell so we can toggle it later
         const cellContainer = new PIXI.Container();
         cellContainer.x = x * 32;
         cellContainer.y = y * 32;
         
         // Store cell info on the container for easy access in dynamic phase
         (cellContainer as any).cellX = x;
         (cellContainer as any).cellY = y;
         (cellContainer as any).cellType = cell?.type || 'empty';
         (cellContainer as any).roomId = cell?.roomId || null;

         this.cachedCells[`${x},${y}`] = cellContainer;
         this.staticLayer.addChild(cellContainer);

         const g = new PIXI.Graphics();
         cellContainer.addChild(g);

         if (!cell || cell.type === 'empty' || cell.type === 'floor') {
            g.rect(0, 0, 32, 32);
            g.fill({ color: 0x111111 });
            g.stroke({ color: 0x222222, width: 1 });
         } else if (cell.type === 'wall') {
            g.rect(0, 0, 32, 32);
            g.fill({ color: 0x00E5FF });
         } else if (cell.type === 'structure_wall') {
            g.rect(0, 0, 32, 32);
            g.fill({ color: 0x555555 });
         } else if (cell.type === 'door_locked') {
            g.rect(0, 0, 32, 32);
            g.fill({ color: 0xFF003C });
         } else if (cell.type === 'door_open') {
            g.rect(0, 0, 32, 32);
            g.fill({ color: 0x111111 });
            g.stroke({ color: 0x00FF66, width: 2 });
         } else if (cell.type === 'cctv') {
            g.rect(0, 0, 32, 32);
            g.fill({ color: 0x111111 });
            g.stroke({ color: 0x222222, width: 1 });
            g.circle(16, 16, 8);
            g.fill({ color: 0xFFFF00 });
         } else if (cell.type === 'furniture') {
            g.rect(0, 0, 32, 32);
            g.fill({ color: 0x111111 });
            g.stroke({ color: 0x222222, width: 1 });
            g.rect(4, 4, 24, 24);
            g.fill({ color: 0x888888 });
         } else if (cell.type === 'breakable_wall') {
            g.rect(0, 0, 32, 32);
            g.fill({ color: 0x111111 });
            g.stroke({ color: 0xaa5522, width: 2 });
            g.moveTo(4, 4);
            g.lineTo(28, 28);
            g.stroke({ color: 0xaa5522, width: 1 });
         } else if (cell.type === 'cupboard') {
            g.rect(0, 0, 32, 32);
            g.fill({ color: 0x444444 });
            g.stroke({ color: 0x222222, width: 1 });
         } else if (cell.type === 'storage_box') {
            g.rect(0, 0, 32, 32);
            g.fill({ color: 0x111111 });
            g.stroke({ color: 0x666666, width: 2 });
            g.rect(8, 8, 16, 16);
            g.fill({ color: 0x666666 });
         } else if (cell.type === 'server_rack') {
            g.rect(2, 2, 28, 28);
            g.fill({ color: 0x111111 });
            g.stroke({ color: 0x00aaff, width: 2 });
         } else if (['chair', 'bed', 'locker', 'sofa', 'plant', 'table', 'monitor'].includes(cell.type)) {
            g.rect(4, 4, 24, 24);
            g.fill({ color: 0x888888 });
            g.stroke({ color: 0x555555, width: 1 });
            
            const text = new PIXI.Text({ text: cell.type.substring(0,2).toUpperCase(), style: { fontSize: 10, fill: 0xffffff } });
            text.x = 16 - text.width / 2;
            text.y = 16 - text.height / 2;
            cellContainer.addChild(text);
         } else if (cell.type === 'grass') {
            g.rect(0, 0, 32, 32);
            g.fill({ color: 0x051105 });
            g.stroke({ color: 0x113311, width: 1 });
            g.moveTo(8, 24); g.lineTo(10, 16);
            g.stroke({ color: 0x00FF00, width: 1 });
         } else if (cell.type === 'street') {
            g.rect(0, 0, 32, 32);
            g.fill({ color: 0x1a1a1a });
            g.stroke({ color: 0x2a2a2a, width: 1 });
            if (x % 2 === 0) {
                g.rect(14, 10, 4, 12);
                g.fill({ color: 0xDDDD00 });
            }
         } else if (cell.type === 'water') {
            g.rect(0, 0, 32, 32);
            g.fill({ color: 0x001133 });
            g.stroke({ color: 0x002255, width: 1 });
            g.moveTo(8, 16); g.lineTo(24, 16);
            g.stroke({ color: 0x0088FF, width: 1 });
         }
         
         if (cell && cell.inventory && Array.isArray(cell.inventory) && cell.inventory.length > 0) {
            g.rect(20, 20, 8, 8);
            g.fill({ color: 0xFFFF00 });
            g.stroke({ color: 0xFF8800, width: 1 });
         }
      }
    }
  }

  private renderDynamicEntities(dim: any, grid: any, rooms: any) {
    if (!this.viewport || !dim || !this.staticLayer) return;

    let myChar: any = null;
    if (this.mode === 'player' && this.activePlayerId && this.characters) {
       myChar = this.characters[this.activePlayerId];
    }
    const playerFov = (myChar && this.sensoryData?.fov?.[myChar.id]) ? this.sensoryData.fov[myChar.id] : [];
    
    // Create a fast lookup for FOV
    const fovSet = new Set<string>();
    if (this.mode === 'player' && myChar) {
       for (const c of playerFov) {
           fovSet.add(`${c.x},${c.y}`);
       }
    }

    // 1. Update static cells visibility (Fog of War)
    for (const key in this.cachedCells) {
        const cellContainer = this.cachedCells[key];
        const cx = (cellContainer as any).cellX;
        const cy = (cellContainer as any).cellY;
        const type = (cellContainer as any).cellType;
        const roomId = (cellContainer as any).roomId;

        let isVisible = true;
        let isRevealed = false;

        if (this.mode === 'player' && myChar) {
            if (fovSet.has(key)) {
                isVisible = true;
            } else {
                isVisible = false;
                const parentRoom = roomId ? rooms[roomId] : null;
                isRevealed = parentRoom?.metadata?.revealedTo && parentRoom.metadata.revealedTo[this.activePlayerId!];
            }
        } else if (this.mode === 'spectator' && roomId) {
            const parentRoom = rooms[roomId];
            isRevealed = parentRoom?.metadata?.revealedTo && Object.values(parentRoom.metadata.revealedTo).some(v => v === true);
            isVisible = isRevealed; // Spectator sees revealed rooms as fully visible
        }

        if (isVisible) {
            cellContainer.visible = true;
            cellContainer.alpha = 1;
        } else if (isRevealed && type === 'structure_wall') {
            cellContainer.visible = true;
            cellContainer.alpha = 1;
        } else {
            cellContainer.visible = false;
        }
    }

    // 2. Update Rooms
    const activeRooms = new Set<string>();
    for (const [roomId, room] of Object.entries(rooms) as [string, any][]) {
      if (!room || !room.bounds) continue;
      let isVisible = true;
      let isMemory = false;

      if (this.mode === 'spectator') {
         const isRevealed = room.metadata?.revealedTo && Object.values(room.metadata.revealedTo).some(v => v === true);
         if (!isRevealed) isVisible = false;
      } else if (this.mode === 'player' && myChar) {
         const cx = Math.floor(room.bounds.x + room.bounds.w/2);
         const cy = Math.floor(room.bounds.y + room.bounds.h/2);
         const hasLos = fovSet.has(`${cx},${cy}`) || playerFov.some((c: any) => c.x >= room.bounds.x && c.x <= room.bounds.x + room.bounds.w && c.y >= room.bounds.y && c.y <= room.bounds.y + room.bounds.h);
         
         if (hasLos) {
            isVisible = true;
            isMemory = false;
         } else {
            const isRevealedToMe = room.metadata?.revealedTo && room.metadata.revealedTo[this.activePlayerId!];
            if (isRevealedToMe) {
               isMemory = true;
               isVisible = true;
            } else {
               isVisible = false;
            }
         }
      }

      if (!isVisible) continue;
      activeRooms.add(roomId);

      let g = this.roomGraphics[roomId];
      if (!g) {
          g = new PIXI.Graphics();
          this.roomLayer.addChild(g);
          this.roomGraphics[roomId] = g;
      } else {
          g.clear();
          g.removeChildren();
      }

      const bounds = room.bounds;
      const isCritical = room.metadata?.threat === 'critical';
      const color = isMemory ? 0x555555 : (isCritical ? 0xff0000 : 0x00E5FF);
      let alpha = isMemory ? 0.2 : (isCritical ? 0.3 : 0.1);

      g.rect(bounds.x * 32, bounds.y * 32, bounds.w * 32, bounds.h * 32);
      g.fill({ color, alpha });
      g.stroke({ color, width: 2, alpha: isMemory ? 0.3 : 1 });
      
      if (!isMemory) {
          const text = new PIXI.Text({ text: room.tag || roomId, style: { fontSize: 14, fill: color, fontFamily: 'monospace' }});
          text.x = bounds.x * 32 + 5;
          text.y = bounds.y * 32 + 5;
          g.addChild(text);
      }
    }

    // Cleanup unused rooms
    Object.keys(this.roomGraphics).forEach(key => {
        if (!activeRooms.has(key)) {
            const g = this.roomGraphics[key];
            this.roomLayer.removeChild(g);
            g.destroy({children: true});
            delete this.roomGraphics[key];
        }
    });

    // 3. Update Characters
    const activeChars = new Set<string>();
    if (this.characters) {
       for (const [charId, char] of Object.entries(this.characters) as [string, any][]) {
          let isVisible = true;
          if (this.mode === 'player' && myChar) {
              isVisible = fovSet.has(`${char.x},${char.y}`);
          } else if (this.mode === 'spectator') {
              isVisible = true;
          }

          if (!isVisible && charId !== this.activePlayerId) continue;
          activeChars.add(charId);
          activeChars.add(charId + '_label');

          let cg = this.charGraphics[charId] as PIXI.Graphics;
          if (!cg) {
              cg = new PIXI.Graphics();
              this.dynamicLayer.addChild(cg);
              this.charGraphics[charId] = cg;
          } else {
              cg.clear();
          }

          const isPlayer = charId.startsWith('p');
          const cx = char.x * 32 + 16;
          const cy = char.y * 32 + 16;
          
          if (isPlayer) {
              const color = charId === this.activePlayerId ? 0x00FF00 : 0x00AAFF;
              cg.circle(cx, cy, 12);
              cg.fill({ color });
              cg.stroke({ color: 0xFFFFFF, width: charId === this.activePlayerId ? 2 : 1 });
              
              const rot = char.rotation || 0;
              cg.moveTo(cx, cy);
              cg.arc(cx, cy, 64, rot - 0.6, rot + 0.6);
              cg.lineTo(cx, cy);
              cg.fill({ color: 0xFFFFFF, alpha: 0.2 });
          } else {
              cg.moveTo(cx, cy - 14);
              cg.lineTo(cx + 14, cy);
              cg.lineTo(cx, cy + 14);
              cg.lineTo(cx - 14, cy);
              cg.fill({ color: 0xFF2A2A });
              cg.stroke({ color: 0xFF0000, width: 2 });
          }

          const labelId = charId + '_label';
          let label = this.charGraphics[labelId] as PIXI.Text;
          if (!label) {
              label = new PIXI.Text({ text: char.name, style: { fontSize: 10, fill: 0xFFFFFF } });
              this.dynamicLayer.addChild(label);
              this.charGraphics[labelId] = label;
          } else {
              label.text = char.name;
          }

          label.x = char.x * 32;
          label.y = char.y * 32 - 15;
       }
    }

    Object.keys(this.charGraphics).forEach(key => {
        if (!activeChars.has(key)) {
            const g = this.charGraphics[key];
            this.dynamicLayer.removeChild(g);
            g.destroy({children: true});
            delete this.charGraphics[key];
        }
    });
    
    // 4. Update Acoustics
    const activeAcoustics = new Set<string>();
    if (this.sensoryData?.acoustics && Array.isArray(this.sensoryData.acoustics)) {
        for (let i = 0; i < this.sensoryData.acoustics.length; i++) {
             const sound = this.sensoryData.acoustics[i];
             const key = `acoustics_${i}`;
             activeAcoustics.add(key);

             let sndGr = this.acousticsSprites[key];
             if (!sndGr) {
                 sndGr = new PIXI.Graphics();
                 this.dynamicLayer.addChild(sndGr);
                 this.acousticsSprites[key] = sndGr;
             } else {
                 sndGr.clear();
             }
             
             sndGr.circle(sound.x * 32 + 16, sound.y * 32 + 16, sound.radius * 32);
             sndGr.stroke({ color: sound.type === 'GUNFIRE' ? 0xFF0000 : 0x00FFFF, width: 2, alpha: 0.5 });
             
             if (sound.cells && Array.isArray(sound.cells)) {
                 for (const cell of sound.cells) {
                     sndGr.rect(cell.x * 32, cell.y * 32, 32, 32);
                     sndGr.fill({ color: sound.type === 'GUNFIRE' ? 0xAA0000 : 0x00AAAA, alpha: 0.2 });
                 }
             }
        }
    }

    Object.keys(this.acousticsSprites).forEach(key => {
        if (!activeAcoustics.has(key)) {
            const s = this.acousticsSprites[key];
            this.dynamicLayer.removeChild(s);
            s.destroy({children: true});
            delete this.acousticsSprites[key];
        }
    });
  }

  ngOnDestroy() {
    if (this.app) {
      this.app.destroy(true, { children: true, texture: true });
    }
  }
}
