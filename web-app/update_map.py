import re

new_code = """import { Component, ElementRef, Input, ViewChild, AfterViewInit, OnDestroy, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GridStore } from './grid.store';

@Component({
  selector: 'app-threejs-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="map-container relative w-full h-full min-h-[500px]" #mapContainer>
        <div class="absolute inset-0 pointer-events-none z-10" style="background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.03) 2px, rgba(0,255,255,0.03) 4px);"></div>
    </div>
  `,
  styles: [`
    .map-container {
      background-color: #050505;
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
  private targetCameraPos: THREE.Vector3 | null = null;
  private targetControlsPos: THREE.Vector3 | null = null;
  private animatedItems: THREE.Mesh[] = [];

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
    // No more async asset loading, build immediately if store has data
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
    if (this.renderer) {
      this.renderer.domElement.removeEventListener('dblclick', this.onDoubleClick.bind(this));
      this.renderer.dispose();
    }
  }

  private initThreeJs(): void {
    const container = this.mapContainer.nativeElement;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#050505');
    this.scene.fog = new THREE.FogExp2('#050505', 0.04);

    // Camera
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;
    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    this.camera.position.set(0, 20, 25);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    
    // Post-processing could go here for bloom, but we'll stick to basic for performance
    
    container.appendChild(this.renderer.domElement);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = true;
    this.controls.maxPolarAngle = Math.PI / 2.1; // Limit to slightly below ground
    
    // Auto rotation for spectator voyeur feel
    if (this.mode === 'spectator') {
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 0.5;
    }

    // Lighting (Minimal, for neon vibes)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight.position.set(10, 30, 20);
    this.scene.add(dirLight);

    this.mapGroup = new THREE.Group();
    this.scene.add(this.mapGroup);

    window.addEventListener('resize', this.onWindowResize.bind(this));
    this.renderer.domElement.addEventListener('dblclick', this.onDoubleClick.bind(this));

    this.animate();
  }

  private buildMap(dimensions: { width: number, height: number } | undefined, grid: Record<string, any>, rooms: Record<string, any>): void {
    if (!dimensions || !dimensions.width) return;
    
    while (this.mapGroup.children.length > 0) {
      const child = this.mapGroup.children[0];
      this.mapGroup.remove(child);
      if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments || child instanceof THREE.GridHelper) {
        if ((child as any).geometry) (child as any).geometry.dispose();
        if (Array.isArray((child as any).material)) {
          (child as any).material.forEach((m: any) => m.dispose());
        } else if ((child as any).material) {
          (child as any).material.dispose();
        }
      }
    }
    this.flickeringLights = [];
    this.animatedItems = [];

    const { width, height } = dimensions;
    const cellSize = 1;
    const offsetX = -width / 2;
    const offsetZ = -height / 2;

    // The Grid Helper (The core of the voyeur look)
    const maxDimension = Math.max(width, height);
    const gridHelper = new THREE.GridHelper(maxDimension, maxDimension, 0x008888, 0x003333);
    gridHelper.position.y = 0.01;
    this.mapGroup.add(gridHelper);

    // Dark Glass Material for walls
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x000000,
      metalness: 0.9,
      roughness: 0.1,
      envMapIntensity: 1.0,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide
    });
    
    // Solid Error Material for breakables
    const errorGlassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x220000,
      metalness: 0.9,
      roughness: 0.1,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide
    });

    if (grid) {
      Object.entries(grid).forEach(([key, cell]) => {
        const [cx, cy] = key.split(',').map(Number);
        const x = cx + offsetX + 0.5;
        const z = cy + offsetZ + 0.5;

        // Walls
        if (cell && (cell.type === 'wall' || cell.type === 'structure_wall' || cell.type === 'door_locked' || cell.type === 'door_open' || cell.type === 'breakable_wall' || cell.isWall === true)) {
          
          let wallHeight = 1.2;
          if (cell.room_id && rooms[cell.room_id]) {
             wallHeight = rooms[cell.room_id].metadata?.zHeight || 1.2;
          }
          
          const isDoor = cell.type === 'door_locked' || cell.type === 'door_open';
          if (isDoor) {
            wallHeight = cell.type === 'door_open' ? 0.05 : 0.6;
          }
          
          const geo = new THREE.BoxGeometry(cellSize, wallHeight, cellSize);
          const mat = (cell.type === 'breakable_wall' || cell.type === 'door_locked') ? errorGlassMaterial : glassMaterial;
          
          const wall = new THREE.Mesh(geo, mat);
          wall.position.set(x, wallHeight / 2, z);
          this.mapGroup.add(wall);
          
          // Wireframe Edge Glow (Very Cyberpunk)
          let edgeColor = 0x00ffff; // Cyan default
          if (cell.type === 'breakable_wall') edgeColor = 0xffaa00; // Orange
          if (cell.type === 'door_locked') edgeColor = 0xff0044; // Red
          if (cell.type === 'door_open') edgeColor = 0x00ff44; // Green
          
          const edges = new THREE.EdgesGeometry(geo);
          const lineMat = new THREE.LineBasicMaterial({ color: edgeColor, transparent: true, opacity: 0.8 });
          const line = new THREE.LineSegments(edges, lineMat);
          line.position.copy(wall.position);
          this.mapGroup.add(line);
        }

        // Furniture / Objects as glowing wireframes
        if (cell && (cell.type === 'furniture' || cell.type === 'cupboard' || cell.type === 'server_rack')) {
          const h = cell.type === 'server_rack' ? 1.8 : cell.type === 'cupboard' ? 1.4 : 0.6;
          const geo = new THREE.BoxGeometry(0.8, h, 0.8);
          
          // Invisible inner, bright edges
          const innerMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.5 });
          const obj = new THREE.Mesh(geo, innerMat);
          obj.position.set(x, h/2, z);
          this.mapGroup.add(obj);

          const edges = new THREE.EdgesGeometry(geo);
          const lineMat = new THREE.LineBasicMaterial({ color: 0xaaaaaa, transparent: true, opacity: 0.6 });
          const line = new THREE.LineSegments(edges, lineMat);
          line.position.copy(obj.position);
          this.mapGroup.add(line);
        }

        // Inventory Items / Storage (Floating glowing octahedrons)
        if (cell && (cell.type === 'storage_box' || (cell.inventory && cell.inventory.length > 0))) {
          const isLoot = cell.inventory && cell.inventory.length > 0;
          const radius = isLoot ? 0.2 : 0.3;
          const geo = new THREE.OctahedronGeometry(radius);
          const mat = new THREE.MeshBasicMaterial({ color: isLoot ? 0x00ffaa : 0xffaa00, wireframe: true });
          const item = new THREE.Mesh(geo, mat);
          
          item.position.set(x, 0.4, z);
          item.userData = { isItem: true, startY: 0.4 };
          this.animatedItems.push(item);
          this.mapGroup.add(item);
        }
      });
    }

    // Room highlighted floors
    if (rooms) {
      Object.keys(rooms).forEach((key, index) => {
        const room = rooms[key];
        if (!room.bounds) return;
        const roomW = room.bounds.w || 3;
        const roomH = room.bounds.h || 3;
        const roomX = (room.bounds.x || 0) + offsetX + roomW / 2;
        const roomZ = (room.bounds.y || 0) + offsetZ + roomH / 2;

        const threat = room.metadata?.threat || 'low';
        let floorColor = 0x003344; // Default cool dark cyan
        let isEmergency = false;

        if (threat === 'critical') {
            floorColor = 0x550000;
            isEmergency = true;
        } else if (threat === 'medium') {
            floorColor = 0x553300;
        }
        
        const roomGeo = new THREE.PlaneGeometry(roomW - 0.2, roomH - 0.2);
        const roomMat = new THREE.MeshBasicMaterial({
          color: floorColor,
          transparent: true,
          opacity: 0.2,
          side: THREE.DoubleSide
        });
        
        const roomMesh = new THREE.Mesh(roomGeo, roomMat);
        roomMesh.rotation.x = -Math.PI / 2;
        roomMesh.position.set(roomX, 0.02, roomZ); 
        roomMesh.userData = { roomId: key };
        this.mapGroup.add(roomMesh);

        // Emergency flashing lights
        if (isEmergency) {
            const roomLight = new THREE.PointLight(0xff0000, 2.0, Math.max(roomW, roomH) * 2);
            roomLight.position.set(roomX, 1.5, roomZ);
            this.mapGroup.add(roomLight);
            this.flickeringLights.push(roomLight);
        }
      });
    }

    // Auto focus camera based on map size
    const distance = (maxDimension / 2) / Math.tan(Math.PI / 6);
    this.camera.position.set(0, distance * 0.8, distance * 0.9);
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

  private onDoubleClick(event: MouseEvent): void {
    if (!this.camera || !this.scene) return;
    
    const container = this.mapContainer.nativeElement;
    const rect = container.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), this.camera);
    
    const intersects = raycaster.intersectObjects(this.mapGroup.children, true);
    for (let i = 0; i < intersects.length; i++) {
        const obj = intersects[i].object;
        if (obj.userData?.['roomId']) {
            const roomCenter = obj.position;
            this.targetControlsPos = roomCenter.clone();
            this.targetCameraPos = roomCenter.clone().add(new THREE.Vector3(0, 8, 10));
            return;
        }
    }
    
    // Double click outside rooms resets camera
    const dimensions = this.gridStore.dimensions();
    if (dimensions) {
        const maxDim = Math.max(dimensions.width, dimensions.height) || 20;
        const distance = (maxDim / 2) / Math.tan(Math.PI / 6);
        this.targetControlsPos = new THREE.Vector3(0, 0, 0);
        this.targetCameraPos = new THREE.Vector3(0, distance * 0.8, distance * 0.9);
    }
  }

  private animate(): void {
    this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
    
    if (this.controls) {
      this.controls.update();
    }

    if (this.targetCameraPos && this.targetControlsPos) {
       this.camera.position.lerp(this.targetCameraPos, 0.05);
       this.controls.target.lerp(this.targetControlsPos, 0.05);
       if (this.camera.position.distanceTo(this.targetCameraPos) < 0.1) {
           this.targetCameraPos = null;
           this.targetControlsPos = null;
       }
    }

    if (this.flickeringLights.length > 0) {
      const time = Date.now() * 0.008;
      this.flickeringLights.forEach(light => {
        light.intensity = 2.0 + Math.sin(time) * 1.5 + Math.random();
      });
    }

    if (this.animatedItems.length > 0) {
      const time = Date.now() * 0.002;
      this.animatedItems.forEach((item, i) => {
        item.rotation.y += 0.03;
        item.rotation.z += 0.02;
        item.position.y = item.userData['startY'] + Math.sin(time + i) * 0.2;
      });
    }
    
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}
"""

with open('/home/matthias/project/zero_sum_rpg/web-app/src/app/threejs-map.component.ts', 'w') as f:
    f.write(new_code)

print("Updated map component to use cyberpunk wireframes.")
