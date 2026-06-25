import { Component, ElementRef, Input, ViewChild, AfterViewInit, OnDestroy, effect, inject, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GridStore } from './grid.store';
import { ThreeJsRendererService } from './services/threejs-renderer.service';

@Component({
  selector: 'app-threejs-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="map-container relative w-full h-full min-h-[500px]" #mapContainer></div>
  `,
  styles: [`
    .map-container {
      background-color: #000000;
    }
  `]
})
export class ThreeJsMapComponent implements AfterViewInit, OnDestroy, OnChanges {
  @Input() characters: Record<string, any> = {};
  @Input() sensoryData: any = {};
  @Input() mode: string = 'spectator';
  @Input() activePlayerId: string | null = null;
  @ViewChild('mapContainer') mapContainer!: ElementRef<HTMLDivElement>;

  private gridStore = inject(GridStore);
  private rendererService = inject(ThreeJsRendererService);

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private animationFrameId: number | null = null;
  private mapGroup!: THREE.Group;
  
  private animatedItems: THREE.Mesh[] = [];
  private charMeshes: Record<string, THREE.Mesh> = {};
  private sharedMaterials: Record<string, THREE.Material> = {};
  private sharedGeometries: Record<string, THREE.BufferGeometry> = {};
  private mapMeshes = new Map<string, THREE.Object3D>();
  private fovMeshes: THREE.Mesh[] = [];
  private vfxMeshes: THREE.Object3D[] = [];
  private lastRenderTime = 0;

  constructor() {
    effect(() => {
      const dimensions = this.gridStore.dimensions();
      const grid = this.gridStore.grid();
      const rooms = this.gridStore.rooms();

      if (this.scene && this.mapGroup) {
        this.buildMap(dimensions, grid, rooms);
      }
    });
  }

  ngAfterViewInit(): void {
    this.initThreeJs();
    setTimeout(() => {
        const dimensions = this.gridStore.dimensions();
        const grid = this.gridStore.grid();
        const rooms = this.gridStore.rooms();
        this.buildMap(dimensions, grid, rooms);
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', this.onWindowResize.bind(this));

    if (this.scene) {
        this.scene.traverse((object: any) => {
            if (!object.isMesh) return;
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
                if (object.material.isMaterial) {
                    this.cleanMaterial(object.material);
                } else {
                    for (const material of object.material) this.cleanMaterial(material);
                }
            }
        });
    }

    Object.values(this.sharedMaterials).forEach(mat => this.cleanMaterial(mat));
    Object.values(this.sharedGeometries).forEach(geo => geo.dispose());
    this.sharedMaterials = {};
    this.sharedGeometries = {};
    this.mapMeshes.clear();
    
    if (this.renderer) {
        this.renderer.dispose();
        this.renderer.forceContextLoss();
        const domElement = this.renderer.domElement;
        if (domElement && domElement.parentNode) {
            domElement.parentNode.removeChild(domElement);
        }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
     if (changes['characters'] && this.scene) {
        this.updateCharacters();
     }
     if (changes['sensoryData'] && this.scene) {
        this.renderSensoryData();
     }
  }

  private cleanMaterial(material: any) {
      material.dispose();
      for (const key of Object.keys(material)) {
          const value = material[key];
          if (value && typeof value === 'object' && 'minFilter' in value) {
              value.dispose();
          }
      }
  }

  private initThreeJs(): void {
    const container = this.mapContainer.nativeElement;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#0a0a0c');

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;
    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    this.camera.position.set(15, 20, 20);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    
    container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2.1; 
    
    if (this.mode === 'spectator') {
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 0.5;
    }

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffeedd, 1.0);
    dirLight.position.set(15, 30, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 150;
    dirLight.shadow.camera.left = -30;
    dirLight.shadow.camera.right = 30;
    dirLight.shadow.camera.top = 30;
    dirLight.shadow.camera.bottom = -30;
    dirLight.shadow.bias = -0.001;
    this.scene.add(dirLight);

    const blueFill = new THREE.DirectionalLight(0x4466ff, 0.6);
    blueFill.position.set(-15, 20, -15);
    this.scene.add(blueFill);

    this.mapGroup = new THREE.Group();
    this.scene.add(this.mapGroup);

    window.addEventListener('resize', this.onWindowResize.bind(this));
    this.animate();
  }

  private buildMap(dimensions: any, grid: any, rooms: any) {
    this.rendererService.buildMap(
      this.scene, this.mapGroup, dimensions, grid, rooms,
      this.sharedMaterials, this.sharedGeometries, this.mapMeshes, this.animatedItems,
      this.camera, this.controls
    );
  }

  private updateCharacters() {
    this.rendererService.updateCharacters(
      this.scene, this.characters, this.charMeshes,
      this.mode, this.activePlayerId, this.sensoryData, this.gridStore.dimensions()
    );
  }

  private renderSensoryData() {
    this.rendererService.renderSensoryData(
      this.scene, this.sensoryData, this.mode, this.activePlayerId,
      this.fovMeshes, this.vfxMeshes, this.gridStore.dimensions()
    );
  }

  private onWindowResize(): void {
    if (!this.camera || !this.renderer || !this.mapContainer) return;
    const container = this.mapContainer.nativeElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private animate(): void {
    this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
    
    const now = performance.now();
    const elapsed = now - this.lastRenderTime;
    
    if (elapsed < 16.6) return;
    this.lastRenderTime = now - (elapsed % 16.6);

    if (this.controls) {
      this.controls.update();
    }

    if (this.animatedItems.length > 0) {
      const time = Date.now() * 0.003;
      this.animatedItems.forEach((item, i) => {
        item.position.y = item.userData['startY'] + Math.sin(time + i) * 0.1;
        item.rotation.y = Math.sin(time * 0.5 + i) * 0.2; 
      });
    }
    
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}
