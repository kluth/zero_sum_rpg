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
  @Input() mode: 'gm' | 'spectator' = 'gm';
  @ViewChild('pixiContainer') pixiContainer!: ElementRef<HTMLDivElement>;
  @Output() cellClicked = new EventEmitter<{x: number, y: number}>();
  @Output() roomClicked = new EventEmitter<string>();

  private app!: PIXI.Application;
  private viewport!: Viewport;
  private gridStore = inject(GridStore);
  
  private sprites: Record<string, PIXI.Sprite | PIXI.Graphics> = {};
  private roomGraphics: Record<string, PIXI.Graphics> = {};

  constructor() {
    effect(() => {
      // Re-render when signals change
      const grid = this.gridStore.grid();
      const rooms = this.gridStore.rooms();
      const dim = this.gridStore.dimensions();
      this.renderMap(dim, grid, rooms);
    });
  }

  async ngAfterViewInit() {
    this.app = new PIXI.Application();
    await this.app.init({
      resizeTo: this.pixiContainer.nativeElement,
      backgroundColor: 0x0a0a0a,
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
  }

  private renderMap(dim: any, grid: any, rooms: any) {
    if (!this.viewport) return;

    // Clear old graphics
    Object.values(this.sprites).forEach(s => this.viewport.removeChild(s));
    Object.values(this.roomGraphics).forEach(g => this.viewport.removeChild(g));
    this.sprites = {};
    this.roomGraphics = {};

    // 1. Draw base grid points (dark cyberpunk metal look)
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
      // Spectator Fog of War check
      const isRevealed = room.metadata?.revealedTo && Object.values(room.metadata.revealedTo).some(v => v === true);
      if (this.mode === 'spectator' && !isRevealed) {
        continue; // Do not render unrevealed rooms for spectators
      }

      const g = new PIXI.Graphics();
      const bounds = room.bounds;
      const isCritical = room.metadata?.threat === 'critical';
      const color = isCritical ? 0xff0000 : 0x00E5FF;
      let alpha = isCritical ? 0.3 : 0.1;
      
      // Dynamic VFX
      if (room.metadata?.vfx === 'flash_red_alert') {
         alpha = 0.6 + Math.sin(Date.now() / 150) * 0.4;
      }

      g.rect(bounds.x * 32, bounds.y * 32, bounds.w * 32, bounds.h * 32);
      g.fill({ color, alpha });
      g.stroke({ color, width: 2 });
      
      this.viewport.addChild(g);
      this.roomGraphics[roomId] = g;
      
      const text = new PIXI.Text({ text: room.tag || roomId, style: { fontSize: 14, fill: color, fontFamily: 'monospace' }});
      text.x = bounds.x * 32 + 5;
      text.y = bounds.y * 32 + 5;
      g.addChild(text);
    }

    // 3. Draw Grid cells & markers
    for (const [key, cell] of Object.entries(grid) as [string, any][]) {
      // For spectators, we check if the cell's room is revealed
      if (this.mode === 'spectator' && cell.room_id) {
         const parentRoom = rooms[cell.room_id];
         const isRevealed = parentRoom?.metadata?.revealedTo && Object.values(parentRoom.metadata.revealedTo).some(v => v === true);
         if (!isRevealed) continue;
      }

      if (cell.type === 'structure_wall') {
        const [x, y] = key.split(',').map(Number);
        const wall = new PIXI.Graphics();
        wall.rect(x * 32, y * 32, 32, 32);
        wall.fill({ color: 0x555555 });
        this.viewport.addChild(wall);
        this.sprites[key] = wall;
      }
      if (cell.type === 'marker') {
        const [x, y] = key.split(',').map(Number);
        const marker = new PIXI.Graphics();
        marker.circle(x * 32 + 16, y * 32 + 16, 12);
        marker.fill({ color: 0xFFD700 });
        this.viewport.addChild(marker);
        this.sprites[key] = marker;
      }
    }
  }

  ngOnDestroy() {
    if (this.app) {
      this.app.destroy(true, { children: true, texture: true });
    }
  }
}
