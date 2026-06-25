import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ThreeJsMapComponent } from './threejs-map.component';
import { GridStore } from './grid.store';
import { ThreeJsRendererService } from './services/threejs-renderer.service';

describe('ThreeJsMapComponent', () => {
  let component: ThreeJsMapComponent;
  let fixture: ComponentFixture<ThreeJsMapComponent>;
  let rendererServiceSpy: jasmine.SpyObj<ThreeJsRendererService>;
  let store: any;

  beforeEach(async () => {
    rendererServiceSpy = jasmine.createSpyObj('ThreeJsRendererService', [
      'buildMap',
      'updateCharacters',
      'renderSensoryData'
    ]);

    await TestBed.configureTestingModule({
      imports: [ThreeJsMapComponent],
      providers: [
        GridStore,
        { provide: ThreeJsRendererService, useValue: rendererServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ThreeJsMapComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(GridStore);
    
    // Mock ngAfterViewInit so real ThreeJS doesn't crash headless DOM
    ThreeJsMapComponent.prototype.ngAfterViewInit = async function() {};

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Refactoring verify - Separation of Concerns', () => {
    it('should delegate map building to ThreeJsRendererService', () => {
      store.setState({ dimensions: { width: 10, height: 10 }, grid: {}, rooms: {} });
      // Simulate effect triggering buildMap
      (component as any).buildMap(store.dimensions(), store.grid(), store.rooms());
      
      expect(rendererServiceSpy.buildMap).toHaveBeenCalled();
    });

    it('should delegate character updating to ThreeJsRendererService', () => {
      component.characters = { 'p1': { x: 0, y: 0 } };
      (component as any).updateCharacters();
      
      expect(rendererServiceSpy.updateCharacters).toHaveBeenCalled();
    });

    it('should delegate sensory data rendering to ThreeJsRendererService', () => {
      component.sensoryData = { fov: [] };
      (component as any).renderSensoryData();
      
      expect(rendererServiceSpy.renderSensoryData).toHaveBeenCalled();
    });
  });
});
