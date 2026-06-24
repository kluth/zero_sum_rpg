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
        <div class="absolute inset-0 pointer-events-none z-10" style="box-shadow: inset 0 0 50px rgba(0,0,0,0.05);"></div>
    </div>
  `,
  styles: [`
    .map-container {
      background-color: #f8f9fa;
      border: 1px solid #e5e7eb;
    }
  `]
})
export class ThreeJsMapComponent implements AfterViewInit, OnDestroy {
  @Input() characters: Record<string, any> = {};
  @Input() mode: string = 'spectator';
  @ViewChild('mapContainer') mapContainer!: ElementRef<HTMLDivElement>;

  private gridStore = inject(GridStore);

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private animationFrameId: number | null = null;
  private mapGroup!: THREE.Group;
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
      this.renderer.dispose();
    }
  }

  private initThreeJs(): void {
    const container = this.mapContainer.nativeElement;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#f8f9fa');
    this.scene.fog = new THREE.Fog('#f8f9fa', 10, 50);

    // Camera
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;
    // Lower FOV for a more isometric/architectural look
    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    this.camera.position.set(15, 20, 20);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    container.appendChild(this.renderer.domElement);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2.2; 
    
    // Smooth cinematic rotation for Voyeur Feed
    if (this.mode === 'spectator') {
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 0.8;
    }

    // Lighting (Studio setup for architectural models)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(15, 30, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 100;
    dirLight.shadow.camera.left = -20;
    dirLight.shadow.camera.right = 20;
    dirLight.shadow.camera.top = 20;
    dirLight.shadow.camera.bottom = -20;
    dirLight.shadow.bias = -0.0005;
    this.scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0xccddff, 0.5);
    fillLight.position.set(-15, 20, -15);
    this.scene.add(fillLight);

    this.mapGroup = new THREE.Group();
    this.scene.add(this.mapGroup);

    window.addEventListener('resize', this.onWindowResize.bind(this));
    this.animate();
  }

  private buildMap(dimensions: { width: number, height: number } | undefined, grid: Record<string, any>, rooms: Record<string, any>): void {
    if (!dimensions || !dimensions.width) return;
    
    while (this.mapGroup.children.length > 0) {
      const child = this.mapGroup.children[0];
      this.mapGroup.remove(child);
      if (child instanceof THREE.Mesh || child instanceof THREE.Group || child instanceof THREE.LineSegments || child instanceof THREE.GridHelper) {
        if ((child as any).geometry) (child as any).geometry.dispose();
        if (Array.isArray((child as any).material)) {
          (child as any).material.forEach((m: any) => m.dispose());
        } else if ((child as any).material) {
          (child as any).material.dispose();
        }
      }
    }
    this.animatedItems = [];

    const { width, height } = dimensions;
    const cellSize = 1;
    const offsetX = -width / 2;
    const offsetZ = -height / 2;

    // Architectural Base / Floor
    const baseGeo = new THREE.BoxGeometry(width + 2, 1, height + 2);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.set(0, -0.5, 0);
    base.receiveShadow = true;
    this.mapGroup.add(base);

    // Subtle Grid on the floor
    const gridHelper = new THREE.GridHelper(Math.max(width, height) + 2, Math.max(width, height) + 2, 0xe5e7eb, 0xf3f4f6);
    gridHelper.position.y = 0.01;
    this.mapGroup.add(gridHelper);

    // Premium Materials
    // Solid clean walls
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.2,
      metalness: 0.1,
    });
    
    // Frosted glass for breakable walls
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xdddddd,
      metalness: 0.1,
      roughness: 0.4,
      transmission: 0.8,
      thickness: 0.5,
      transparent: true,
      opacity: 0.9,
    });

    // Sleek red polymer for doors
    const doorMaterial = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.3,
      metalness: 0.2,
    });
    
    // Sleek green for open doors
    const doorOpenMaterial = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      roughness: 0.3,
      metalness: 0.2,
    });

    if (grid) {
      Object.entries(grid).forEach(([key, cell]) => {
        const [cx, cy] = key.split(',').map(Number);
        const x = cx + offsetX + 0.5;
        const z = cy + offsetZ + 0.5;

        // Walls
        if (cell && (cell.type === 'wall' || cell.type === 'structure_wall' || cell.type === 'door_locked' || cell.type === 'door_open' || cell.type === 'breakable_wall' || cell.isWall === true)) {
          
          let wallHeight = 1.5; // Taller walls look more architectural
          let wallThickness = 1.0;
          let yOffset = wallHeight / 2;
          let mat = wallMaterial;

          if (cell.type === 'breakable_wall') {
             mat = glassMaterial;
          } else if (cell.type === 'door_locked') {
             mat = doorMaterial;
             wallThickness = 0.8;
             wallHeight = 1.2;
             yOffset = wallHeight / 2;
          } else if (cell.type === 'door_open') {
             mat = doorOpenMaterial;
             wallThickness = 0.8;
             wallHeight = 0.1;
             yOffset = wallHeight / 2;
          }

          const geo = new THREE.BoxGeometry(wallThickness, wallHeight, wallThickness);
          const wall = new THREE.Mesh(geo, mat);
          wall.position.set(x, yOffset, z);
          wall.castShadow = true;
          wall.receiveShadow = true;
          
          // Slight scale up to seamlessly merge adjacent wall blocks
          if (wallThickness === 1.0) {
              wall.scale.set(1.001, 1, 1.001);
          }
          this.mapGroup.add(wall);
        }

        // Furniture - Abstract Sleek Shapes instead of Boxes
        if (cell && cell.type === 'furniture') {
          // Desk/Table: A flat surface with a central pedestal
          const topGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.05, 32);
          const topMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.1, metalness: 0.8 });
          const top = new THREE.Mesh(topGeo, topMat);
          top.position.set(x, 0.6, z);
          top.castShadow = true;
          
          const legGeo = new THREE.CylinderGeometry(0.05, 0.1, 0.6, 16);
          const legMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.9 });
          const leg = new THREE.Mesh(legGeo, legMat);
          leg.position.set(x, 0.3, z);
          leg.castShadow = true;
          
          this.mapGroup.add(top);
          this.mapGroup.add(leg);
        }

        if (cell && cell.type === 'cupboard') {
          // Sleek tall cabinet
          const geo = new THREE.BoxGeometry(0.7, 1.6, 0.7);
          const mat = new THREE.MeshStandardMaterial({ color: 0xe5e7eb, roughness: 0.6 });
          const cupboard = new THREE.Mesh(geo, mat);
          cupboard.position.set(x, 0.8, z);
          cupboard.castShadow = true;
          cupboard.receiveShadow = true;
          this.mapGroup.add(cupboard);
        }

        if (cell && cell.type === 'server_rack') {
          // Dark monolith server rack with an LED strip
          const rackGeo = new THREE.BoxGeometry(0.6, 1.8, 0.6);
          const rackMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.1, metalness: 0.5 });
          const rack = new THREE.Mesh(rackGeo, rackMat);
          rack.position.set(x, 0.9, z);
          rack.castShadow = true;
          this.mapGroup.add(rack);
          
          // Glowing LED strip
          const ledGeo = new THREE.BoxGeometry(0.62, 0.05, 0.62);
          const ledMat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9 });
          const led = new THREE.Mesh(ledGeo, ledMat);
          led.position.set(x, 1.5, z);
          this.mapGroup.add(led);
        }

        // Inventory Items / Storage (Floating sleek spheres)
        if (cell && (cell.type === 'storage_box' || (cell.inventory && cell.inventory.length > 0))) {
          const isLoot = cell.inventory && cell.inventory.length > 0;
          const radius = isLoot ? 0.15 : 0.25;
          const geo = new THREE.SphereGeometry(radius, 32, 32);
          
          const mat = new THREE.MeshStandardMaterial({ 
             color: isLoot ? 0x10b981 : 0x0ea5e9, 
             emissive: isLoot ? 0x004422 : 0x002244,
             roughness: 0.1,
             metalness: 0.8
          });
          const item = new THREE.Mesh(geo, mat);
          
          item.position.set(x, 0.5, z);
          item.castShadow = true;
          item.userData = { startY: 0.5 };
          this.animatedItems.push(item);
          this.mapGroup.add(item);
        }
      });
    }

    // Room highlights (Subtle floor decals)
    if (rooms) {
      Object.keys(rooms).forEach((key, index) => {
        const room = rooms[key];
        if (!room.bounds) return;
        const roomW = room.bounds.w || 3;
        const roomH = room.bounds.h || 3;
        const roomX = (room.bounds.x || 0) + offsetX + roomW / 2;
        const roomZ = (room.bounds.y || 0) + offsetZ + roomH / 2;

        const threat = room.metadata?.threat || 'low';
        let floorColor = 0xe0f2fe; // Light blue
        let isEmergency = false;

        if (threat === 'critical') {
            floorColor = 0xfee2e2; // Light red
            isEmergency = true;
        } else if (threat === 'medium') {
            floorColor = 0xffedd5; // Light orange
        }
        
        const roomGeo = new THREE.PlaneGeometry(roomW - 0.2, roomH - 0.2);
        const roomMat = new THREE.MeshStandardMaterial({
          color: floorColor,
          roughness: 0.9,
        });
        
        const roomMesh = new THREE.Mesh(roomGeo, roomMat);
        roomMesh.rotation.x = -Math.PI / 2;
        roomMesh.position.set(roomX, 0.02, roomZ); 
        roomMesh.receiveShadow = true;
        this.mapGroup.add(roomMesh);
      });
    }

    // Auto focus camera based on map size
    const maxDimension = Math.max(width, height);
    const distance = (maxDimension / 2) / Math.tan(Math.PI / 8);
    this.camera.position.set(distance * 0.7, distance * 0.8, distance * 0.7);
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

    if (this.animatedItems.length > 0) {
      const time = Date.now() * 0.002;
      this.animatedItems.forEach((item, i) => {
        item.position.y = item.userData['startY'] + Math.sin(time + i) * 0.1;
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

print("Updated map component to 'Light Theme Architectural Scale Model' style.")
