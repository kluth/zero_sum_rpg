import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, inject, effect, Output, EventEmitter, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as PIXI from 'pixi.js';
import { Viewport } from 'pixi-viewport';
import { GridStore } from './grid.store';
import { PixiRendererService } from './services/pixi-renderer.service';

@Component({
  selector: 'app-pixi-map',
  standalone: true,
  imports: [CommonModule],
  template: `<div #pixiContainer style="width: 100%; height: 100%; overflow: hidden; border: 1px solid #1a1a1c; border-radius: 0px;"></div>`
})
export class PixiMapComponent implements AfterViewInit, OnDestroy, OnChanges {
  @Input() characters: Record<string, any> = {};
  @Input() sensoryData: any = {};
  @Input() activePlayerId: string | null = null;
  @Input() currentLevel: number = 1;
  @Input() mode: 'gm' | 'spectator' | 'player' | 'billboard' | 'netrunner' = 'gm';
  @Input() paintMode: string | null = null;
  @ViewChild('pixiContainer') pixiContainer!: ElementRef<HTMLDivElement>;
  @Output() cellClicked = new EventEmitter<{x: number, y: number}>();
  @Output() roomClicked = new EventEmitter<string>();
  @Output() cellPainted = new EventEmitter<{x: number, y: number, type: string}>();
  @Output() playerMoved = new EventEmitter<{x: number, y: number}>();

  private app!: PIXI.Application;
  private viewport!: Viewport;
  private gridStore = inject(GridStore);
  private rendererService = inject(PixiRendererService);
  
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

  private setupViewportEvents(isPainting: boolean) {
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

    this.viewport.on('clicked', (e) => this.handleViewportClick(e));
  }

  private handleViewportClick(e: any) {
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

    this.setupViewportEvents(false);

    this.app.ticker.add((ticker) => {
        Object.keys(this.roomGraphics).forEach(roomId => {
            const room = this.gridStore.rooms()[roomId];
            if (room?.metadata?.vfx === 'flash_red_alert') {
                const g = this.roomGraphics[roomId];
                if (g) g.alpha = 0.5 + Math.sin(Date.now() / 150) * 0.3;
            }
        });
    });

    const dim = this.gridStore.dimensions();
    const grid = this.gridStore.grid();
    const rooms = this.gridStore.rooms();
    if (dim) {
       this.renderStaticMap(dim, grid, rooms);
       this.renderDynamicEntities(dim, grid, rooms);
    }
  }

  private hasLineOfSight(x0: number, y0: number, x1: number, y1: number, grid: any): boolean {
     return this.rendererService.hasLineOfSight(x0, y0, x1, y1, this.currentLevel, grid);
  }

  private renderStaticMap(dim: any, grid: any, rooms: any) {
    if (!this.viewport || !dim || !this.staticLayer) return;
    this.rendererService.renderStaticMap(this.staticLayer, dim, grid, rooms, this.currentLevel, this.cachedCells);
  }

  private renderDynamicEntities(dim: any, grid: any, rooms: any) {
    if (!this.viewport || !dim || !this.staticLayer) return;
    this.rendererService.renderDynamicEntities(
      this.dynamicLayer, this.roomLayer, dim, grid, rooms,
      this.mode, this.activePlayerId, this.characters, this.sensoryData, this.currentLevel,
      this.cachedCells, this.roomGraphics, this.charGraphics, this.acousticsSprites
    );
  }

  ngOnDestroy() {
    if (this.app) {
      this.app.destroy(true, { children: true, texture: true });
    }
  }
}
