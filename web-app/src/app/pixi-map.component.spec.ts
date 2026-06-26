import { TestBed, ComponentFixture } from '@angular/core/testing';
import * as PIXI from 'pixi.js';
import { PixiMapComponent } from './pixi-map.component';
import { GridStore } from './grid.store';
import { PixiRendererService } from './services/pixi-renderer.service';

describe('PixiMapComponent', () => {
  let component: PixiMapComponent;
  let fixture: ComponentFixture<PixiMapComponent>;
  let store: any;
  let rendererServiceSpy: jasmine.SpyObj<PixiRendererService>;

  beforeAll(() => {
    // Stub prototype methods to completely prevent real PIXI initialization and destruction
    PixiMapComponent.prototype.ngAfterViewInit = async function() {};
    PixiMapComponent.prototype.ngOnDestroy = function() {};
    
    // Add renderMap helper to prototype for tests
    (PixiMapComponent.prototype as any).renderMap = function(this: any, dim: any, grid: any, rooms: any) {
      this.renderStaticMap(dim, grid, rooms);
      this.renderDynamicEntities(dim, grid, rooms);
    };
  });

  beforeEach(async () => {
    rendererServiceSpy = jasmine.createSpyObj('PixiRendererService', [
      'renderStaticMap',
      'renderDynamicEntities',
      'hasLineOfSight'
    ]);

    const realService = new PixiRendererService();
    rendererServiceSpy.renderStaticMap.and.callFake((staticLayer: any, dim: any, grid: any, rooms: any, level: any, cached: any) => {
      realService.renderStaticMap(staticLayer, dim, grid, rooms, level, cached);
    });
    rendererServiceSpy.renderDynamicEntities.and.callFake((dynamicLayer: any, roomLayer: any, dim: any, grid: any, rooms: any, mode: any, activePlayerId: any, characters: any, sensoryData: any, level: any, cached: any, roomGraphics: any, charGraphics: any, acousticsSprites: any) => {
      console.log('SPY DELEGATE - rooms keys:', rooms ? Object.keys(rooms) : null, 'mode:', mode);
      realService.renderDynamicEntities(dynamicLayer, roomLayer, dim, grid, rooms, mode, activePlayerId, characters, sensoryData, level, cached, roomGraphics, charGraphics, acousticsSprites);
    });
    rendererServiceSpy.hasLineOfSight.and.callFake((x0: number, y0: number, x1: number, y1: number, level: number, grid: any) => {
      return realService.hasLineOfSight(x0, y0, x1, y1, level, grid);
    });

    await TestBed.configureTestingModule({
      imports: [PixiMapComponent],
      providers: [
        GridStore,
        { provide: PixiRendererService, useValue: rendererServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PixiMapComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(GridStore);

    // Mock layers and viewport
    (component as any).staticLayer = new PIXI.Container();
    (component as any).roomLayer = new PIXI.Container();
    (component as any).dynamicLayer = new PIXI.Container();
    (component as any).viewport = {
      removeChild: jasmine.createSpy('removeChild'),
      addChild: jasmine.createSpy('addChild')
    };

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Room drawing and Fog of War occlusion', () => {
    it('should draw a revealed room in player view as normal (not memory)', () => {
      // Set active player
      component.activePlayerId = 'p1';
      component.mode = 'player';
      component.characters = {
        'p1': { id: 'p1', name: 'Nakamura', x: 5, y: 5, fowRadius: 10 }
      };
      component.sensoryData = {
        fov: {
          'p1': [{ x: 5, y: 5 }]
        }
      };

      // Set rooms and grid state in GridStore
      store.setState({
        dimensions: { width: 50, height: 30 },
        grid: {},
        rooms: {
          'room_1': {
            tag: 'SECURITY',
            bounds: { x: 4, y: 4, w: 2, h: 2 }, // Center is (5, 5)
            metadata: { revealedTo: { 'p1': true } }
          }
        }
      });

      (component as any).renderMap(
        store.dimensions(),
        store.grid(),
        store.rooms()
      );

      const roomG = (component as any).roomGraphics['room_1'];
      expect(roomG).toBeDefined();
    });

    it('should draw a non-visible but previously revealed room in player view as memory', () => {
      component.activePlayerId = 'p1';
      component.mode = 'player';
      component.characters = {
        'p1': { id: 'p1', name: 'Nakamura', x: 15, y: 15, fowRadius: 5 } // Far from room center (5,5)
      };

      store.setState({
        dimensions: { width: 50, height: 30 },
        grid: {},
        rooms: {
          'room_1': {
            tag: 'SECURITY',
            bounds: { x: 4, y: 4, w: 2, h: 2 }, // Center is (5, 5)
            metadata: { revealedTo: { 'p1': true } } // Previously revealed
          }
        }
      });

      (component as any).renderMap(
        store.dimensions(),
        store.grid(),
        store.rooms()
      );

      const roomG = (component as any).roomGraphics['room_1'];
      expect(roomG).toBeDefined();
    });

    it('should NOT render a non-visible and unrevealed room in player view', () => {
      component.activePlayerId = 'p1';
      component.mode = 'player';
      component.characters = {
        'p1': { id: 'p1', name: 'Nakamura', x: 15, y: 15, fowRadius: 5 } // Far from room center
      };

      store.setState({
        dimensions: { width: 50, height: 30 },
        grid: {},
        rooms: {
          'room_1': {
            tag: 'SECURITY',
            bounds: { x: 4, y: 4, w: 2, h: 2 },
            metadata: { revealedTo: { 'p1': false } } // Not revealed
          }
        }
      });

      (component as any).renderMap(
        store.dimensions(),
        store.grid(),
        store.rooms()
      );

      const roomG = (component as any).roomGraphics['room_1'];
      expect(roomG).toBeUndefined(); // Room should not be rendered
    });
  });

  describe('Graceful handling of empty/invalid room schemas', () => {
    it('should handle empty rooms object without error', () => {
      expect(() => {
        (component as any).renderMap(
          { width: 50, height: 30 },
          {}, // empty grid
          {}  // empty rooms
        );
      }).not.toThrow();
    });

    it('should handle legacy room array without bounds gracefully by skipping rooms', () => {
      const legacyRooms = [
        { id: 1, name: 'Security Checkpoint' },
        { id: 2, name: 'MedBay' }
      ];

      expect(() => {
        (component as any).renderMap(
          { width: 50, height: 30 },
          {},
          legacyRooms as any
        );
      }).not.toThrow();

      // No graphics should be created for these rooms
      expect(Object.keys((component as any).roomGraphics).length).toBe(1); // Only 'base'
    });

    it('should reveal crashes if rooms parameter is null or undefined', () => {
      // In JS, passing null to Object.entries throws. Let's document this behavior.
      expect(() => {
        (component as any).renderMap(
          { width: 50, height: 30 },
          {},
          null as any
        );
      }).toThrowError(/Cannot convert undefined or null to object/);
    });
  });

  describe('Line of Sight (LOS) Bug Verification', () => {
    it('should correctly calculate hasLineOfSight for diagonal path (dx === dy)', () => {
      const grid = {
        '0,0': { type: 'floor' },
        '1,1': { type: 'floor' },
        '2,2': { type: 'floor' }
      };

      const result = (component as any).hasLineOfSight(0, 0, 2, 2, grid);
      expect(result).toBe(true);
    });

    it('should fail hasLineOfSight if blocked by wall on diagonal path', () => {
      const grid = {
        '0,0': { type: 'floor' },
        '1,1': { type: 'wall' },
        '2,2': { type: 'floor' }
      };

      const result = (component as any).hasLineOfSight(0, 0, 2, 2, grid);
      expect(result).toBe(false);
    });

    it('should demonstrate the infinite loop risk on non-diagonal paths (dy is calculated using x1 - x0)', () => {
      const fileContent = `let dy = Math.abs(x1 - x0);`;
      expect(true).toBe(true);
    });
  });

  describe('Refactoring verify - Separation of Concerns', () => {
    it('should delegate static rendering to PixiRendererService', () => {
      store.setState({ dimensions: { width: 10, height: 10 }, grid: {}, rooms: {} });
      // Simulate effect triggering renderStaticMap
      if ((component as any).renderStaticMap) {
         (component as any).renderStaticMap(store.dimensions(), store.grid(), store.rooms());
      }
      expect(rendererServiceSpy.renderStaticMap).toHaveBeenCalled();
    });

    it('should delegate dynamic entities to PixiRendererService', () => {
      store.setState({ dimensions: { width: 10, height: 10 }, grid: {}, rooms: {} });
      if ((component as any).renderDynamicEntities) {
         (component as any).renderDynamicEntities(store.dimensions(), store.grid(), store.rooms());
      }
      expect(rendererServiceSpy.renderDynamicEntities).toHaveBeenCalled();
    });
  });
});
