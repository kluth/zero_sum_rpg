import { Component, ElementRef, Input, ViewChild, AfterViewInit, OnDestroy, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GridStore } from './grid.store';

@Component({
  selector: 'app-threejs-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="map-container" #mapContainer></div>
  `,
  styles: [`
    .map-container {
      width: 100%;
      height: 100%;
      min-height: 500px;
      background-color: #050510;
      border: 1px solid #00ffff;
      box-shadow: 0 0 15px rgba(0, 255, 255, 0.2);
    }
  `]
})
export class ThreeJsMapComponent implements AfterViewInit, OnDestroy {
  @Input() characters: Record<string, any> = {};
  @Input() mode: string = 'gm';
  @ViewChild('mapContainer') mapContainer!: ElementRef<HTMLDivElement>;

  private gridStore = inject(GridStore);

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private animationFrameId: number | null = null;
  private mapGroup!: THREE.Group;
  private flickeringLights: THREE.PointLight[] = [];

  constructor() {
    // Setup effect to react to grid store changes
    effect(() => {
      const dimensions = this.gridStore.dimensions();
      const grid = this.gridStore.grid();
      const rooms = this.gridStore.rooms();

      // Rebuild the map when signals change, if the scene is ready
      if (this.scene && this.mapGroup) {
        this.buildMap(dimensions, grid, rooms);
      }
    });
  }

  ngAfterViewInit(): void {
    this.initThreeJs();
    // Do initial build
    const dimensions = this.gridStore.dimensions();
    const grid = this.gridStore.grid();
    const rooms = this.gridStore.rooms();
    this.buildMap(dimensions, grid, rooms);
  }

  ngOnDestroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', this.onWindowResize.bind(this));
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  private initThreeJs(): void {
    const container = this.mapContainer.nativeElement;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#050510');
    this.scene.fog = new THREE.FogExp2('#050510', 0.03);

    // Camera
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;
    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    this.camera.position.set(0, 15, 20);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.05; // Keep camera above ground

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(20, 40, 20);
    this.scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x00ffff, 1, 50);
    pointLight.position.set(0, 10, 0);
    this.scene.add(pointLight);

    this.mapGroup = new THREE.Group();
    this.scene.add(this.mapGroup);

    // Resize listener
    window.addEventListener('resize', this.onWindowResize.bind(this));

    this.animate();
  }

  private buildMap(dimensions: { width: number, height: number } | undefined, grid: Record<string, any>, rooms: Record<string, any>): void {
    if (!dimensions) return;
    
    // Clear existing map objects
    while (this.mapGroup.children.length > 0) {
      const child = this.mapGroup.children[0];
      this.mapGroup.remove(child);
      if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments) {
        if (child.geometry) child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else if (child.material) {
          child.material.dispose();
        }
      }
    }
    this.flickeringLights = [];

    const { width, height } = dimensions;
    const cellSize = 1;
    const offsetX = -width / 2;
    const offsetZ = -height / 2;

    // Shared Materials
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x111122,
      roughness: 0.9,
      metalness: 0.1,
    });

    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0x444444,
      roughness: 0.3,
      metalness: 0.5,
      transparent: true,
      opacity: 0.9,
    });

    // Floor Grid Surface
    const floorGeometry = new THREE.PlaneGeometry(width, height, width, height);
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, 0);
    this.mapGroup.add(floor);

    // Walls
    if (grid) {
      Object.entries(grid).forEach(([key, cell]) => {
        if (cell && (cell.type === 'wall' || cell.isWall === true)) {
          const [cx, cy] = key.split(',').map(Number);
          const x = cx + offsetX + 0.5;
          const z = cy + offsetZ + 0.5;
          
          let wallHeight = 1;
          if (cell.room_id && rooms[cell.room_id]) {
             wallHeight = rooms[cell.room_id].metadata?.zHeight || 1;
          }
          
          const wallGeo = new THREE.BoxGeometry(cellSize, wallHeight, cellSize);
          const wall = new THREE.Mesh(wallGeo, wallMaterial);
          wall.position.set(x, wallHeight / 2, z);
          this.mapGroup.add(wall);
          
          // Edge glow
          const edges = new THREE.EdgesGeometry(wallGeo);
          const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ffff, linewidth: 2 });
          const line = new THREE.LineSegments(edges, lineMaterial);
          line.position.copy(wall.position);
          this.mapGroup.add(line);
        }
      });
    }

    // Rooms
    if (rooms) {
      Object.values(rooms).forEach((room: any, index) => {
        if (!room.bounds) return;
        const roomW = room.bounds.w || 3;
        const roomH = room.bounds.h || 3;
        const roomX = (room.bounds.x || 0) + offsetX + roomW / 2;
        const roomZ = (room.bounds.y || 0) + offsetZ + roomH / 2;

        const roomColor = new THREE.Color().setHSL((index * 137.5) % 360 / 360, 0.8, 0.5);
        
        const roomGeo = new THREE.PlaneGeometry(roomW - 0.2, roomH - 0.2);
        const roomMat = new THREE.MeshStandardMaterial({
          color: roomColor,
          roughness: 0.5,
          metalness: 0.2,
          transparent: true,
          opacity: 0.6,
          side: THREE.DoubleSide,
          depthWrite: false
        });
        
        const roomMesh = new THREE.Mesh(roomGeo, roomMat);
        roomMesh.rotation.x = -Math.PI / 2;
        roomMesh.position.set(roomX, 0.05, roomZ); // Slightly elevated to prevent z-fighting
        this.mapGroup.add(roomMesh);

        // Add Room Lighting based on Threat Level
        const threat = room.metadata?.threat || 'low';
        let lightColor = 0x00ffff;
        let intensity = 2.0;
        let distance = Math.max(roomW, roomH) * 1.5;
        let isEmergency = false;

        if (threat === 'critical') {
            lightColor = 0xff0000;
            intensity = 5.0;
            isEmergency = true;
        } else if (threat === 'medium') {
            lightColor = 0xffa500; // Orange
            intensity = 3.0;
        }

        const roomLight = new THREE.PointLight(lightColor, intensity, distance);
        const zHeight = room.metadata?.zHeight || 1;
        roomLight.position.set(roomX, zHeight * 0.8, roomZ);
        this.mapGroup.add(roomLight);

        if (isEmergency) {
            this.flickeringLights.push(roomLight);
        }
      });
    }

    // Focus camera
    const maxDim = Math.max(width, height) || 20;
    this.camera.position.set(0, maxDim * 0.8, maxDim * 0.8);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
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
    
    if (this.controls) {
      this.controls.update();
    }

    // Flickering logic for emergency lights
    if (this.flickeringLights.length > 0) {
      const time = Date.now() * 0.005;
      this.flickeringLights.forEach(light => {
        light.intensity = 2.0 + Math.sin(time * 2.0) * 2.0 + Math.random() * 2.0;
      });
    }
    
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}
