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
    <div class="map-container relative w-full h-full min-h-[500px]" #mapContainer></div>
  `,
  styles: [`
    .map-container {
      background-color: #000000;
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

  // --- Procedural Textures ---
  private createRaufaserTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#fdfdfd';
    ctx.fillRect(0, 0, 512, 512);
    // Subtle noise
    for(let i=0; i<40000; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? '#f0f0f0' : '#ffffff';
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        ctx.fillRect(x, y, 2, 2);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  private createRaufaserBumpMap(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 512, 512);
    for(let i=0; i<40000; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? '#909090' : '#707070';
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        ctx.fillRect(x, y, 2, 2);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  private createBrushedSteelTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#333333';
    ctx.fillRect(0, 0, 512, 512);
    ctx.fillStyle = '#444444';
    for(let i=0; i<10000; i++) {
        const y = Math.random() * 512;
        const x = Math.random() * 512;
        const w = 10 + Math.random() * 100;
        ctx.fillRect(x, y, w, 1);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  private createConcreteTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#555555';
    ctx.fillRect(0, 0, 512, 512);
    for(let i=0; i<20000; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? '#505050' : '#5a5a5a';
        ctx.beginPath();
        ctx.arc(Math.random() * 512, Math.random() * 512, Math.random() * 3, 0, Math.PI * 2);
        ctx.fill();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  private createCarpetTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#2c3e50'; // dark blueish carpet
    ctx.fillRect(0, 0, 256, 256);
    for(let i=0; i<15000; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? '#34495e' : '#22313f';
        ctx.fillRect(Math.random() * 256, Math.random() * 256, 1, 1);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  private createWoodTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#8b5a2b';
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = '#6b4226';
    for(let i=0; i<1000; i++) {
        ctx.fillRect(Math.random() * 256, Math.random() * 256, 50 + Math.random() * 100, 2);
    }
    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }

  // --- Furniture Builders ---
  private buildDesk(x: number, y: number, z: number): THREE.Group {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    // Wood top
    const topGeo = new THREE.BoxGeometry(0.8, 0.05, 0.5);
    const topMat = new THREE.MeshStandardMaterial({ map: this.createWoodTexture(), roughness: 0.8 });
    const top = new THREE.Mesh(topGeo, topMat);
    top.position.set(0, 0.7, 0);
    top.castShadow = true;
    top.receiveShadow = true;
    group.add(top);

    // Steel legs
    const legGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.7, 8);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.8, roughness: 0.3 });
    const positions = [
        [-0.35, 0.35, -0.2], [0.35, 0.35, -0.2],
        [-0.35, 0.35, 0.2], [0.35, 0.35, 0.2]
    ];
    positions.forEach(pos => {
        const leg = new THREE.Mesh(legGeo, legMat);
        leg.position.set(pos[0], pos[1], pos[2]);
        leg.castShadow = true;
        group.add(leg);
    });

    // Monitor on desk
    const monitorGeo = new THREE.BoxGeometry(0.3, 0.2, 0.05);
    const monitorMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2 });
    const monitor = new THREE.Mesh(monitorGeo, monitorMat);
    monitor.position.set(0, 0.825, -0.1);
    monitor.castShadow = true;
    group.add(monitor);

    // Screen glow
    const screenGeo = new THREE.PlaneGeometry(0.28, 0.18);
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(0, 0.825, -0.074);
    group.add(screen);

    return group;
  }

  private buildServerRack(x: number, y: number, z: number): THREE.Group {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    const rackGeo = new THREE.BoxGeometry(0.7, 1.8, 0.7);
    const steelTex = this.createBrushedSteelTexture();
    const rackMat = new THREE.MeshStandardMaterial({ map: steelTex, metalness: 0.9, roughness: 0.4 });
    const rack = new THREE.Mesh(rackGeo, rackMat);
    rack.position.set(0, 0.9, 0);
    rack.castShadow = true;
    rack.receiveShadow = true;
    group.add(rack);

    // LED dots
    for(let i=0; i<8; i++) {
        const ledGeo = new THREE.BoxGeometry(0.4, 0.02, 0.72);
        const ledMat = new THREE.MeshBasicMaterial({ color: Math.random() > 0.5 ? 0x00ff00 : 0x0088ff });
        const led = new THREE.Mesh(ledGeo, ledMat);
        led.position.set(0, 0.4 + (i * 0.15), 0);
        group.add(led);
    }

    return group;
  }

  private buildCupboard(x: number, y: number, z: number): THREE.Group {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    const boxGeo = new THREE.BoxGeometry(0.8, 1.6, 0.6);
    const boxMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.position.set(0, 0.8, 0);
    box.castShadow = true;
    box.receiveShadow = true;
    group.add(box);

    // Handles
    const handleGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.4);
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.9 });
    const handle1 = new THREE.Mesh(handleGeo, handleMat);
    handle1.position.set(-0.05, 0.8, 0.31);
    const handle2 = new THREE.Mesh(handleGeo, handleMat);
    handle2.position.set(0.05, 0.8, 0.31);
    group.add(handle1);
    group.add(handle2);

    return group;
  }

  private buildCrate(x: number, y: number, z: number): THREE.Group {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    const boxGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const boxMat = new THREE.MeshStandardMaterial({ map: this.createBrushedSteelTexture(), metalness: 0.8, roughness: 0.5 });
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.position.set(0, 0.25, 0);
    box.castShadow = true;
    box.receiveShadow = true;
    group.add(box);

    // Orange accents
    const accentGeo = new THREE.BoxGeometry(0.52, 0.05, 0.52);
    const accentMat = new THREE.MeshStandardMaterial({ color: 0xff6600, roughness: 0.8 });
    const accent1 = new THREE.Mesh(accentGeo, accentMat);
    accent1.position.set(0, 0.1, 0);
    const accent2 = new THREE.Mesh(accentGeo, accentMat);
    accent2.position.set(0, 0.4, 0);
    group.add(accent1);
    group.add(accent2);

    return group;
  }

  private initThreeJs(): void {
    const container = this.mapContainer.nativeElement;

    this.scene = new THREE.Scene();
    // Darker, moodier background
    this.scene.background = new THREE.Color('#0a0a0c');

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;
    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    this.camera.position.set(15, 20, 20);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2.1; 
    
    if (this.mode === 'spectator') {
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 0.5;
    }

    // Moody realistic lighting
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

  private buildMap(dimensions: { width: number, height: number } | undefined, grid: Record<string, any>, rooms: Record<string, any>): void {
    if (!dimensions || !dimensions.width) return;
    
    while (this.mapGroup.children.length > 0) {
      const child = this.mapGroup.children[0];
      this.mapGroup.remove(child);
      if (child instanceof THREE.Mesh || child instanceof THREE.Group) {
        // We let the garbage collector handle material cleanup for simplicity here,
        // to avoid killing shared procedurals
      }
    }
    this.animatedItems = [];

    const { width, height } = dimensions;
    const cellSize = 1;
    const offsetX = -width / 2;
    const offsetZ = -height / 2;

    // Base materials
    const raufaserTex = this.createRaufaserTexture();
    const raufaserBump = this.createRaufaserBumpMap();
    const steelTex = this.createBrushedSteelTexture();
    const concreteTex = this.createConcreteTexture();
    const carpetTex = this.createCarpetTexture();

    const raufaserMat = new THREE.MeshStandardMaterial({
        map: raufaserTex,
        bumpMap: raufaserBump,
        bumpScale: 0.05,
        roughness: 0.9,
    });

    const bunkerSteelMat = new THREE.MeshStandardMaterial({
        map: steelTex,
        metalness: 0.8,
        roughness: 0.4,
        color: 0x888888
    });

    const concreteFloorMat = new THREE.MeshStandardMaterial({
        map: concreteTex,
        roughness: 0.8
    });

    const carpetFloorMat = new THREE.MeshStandardMaterial({
        map: carpetTex,
        roughness: 1.0
    });

    // Default global floor (concrete foundation)
    const baseGeo = new THREE.BoxGeometry(width + 2, 0.5, height + 2);
    const base = new THREE.Mesh(baseGeo, concreteFloorMat);
    base.position.set(0, -0.25, 0);
    base.receiveShadow = true;
    this.mapGroup.add(base);

    // Determine room properties
    const roomIsBunker: Record<string, boolean> = {};
    if (rooms) {
      Object.keys(rooms).forEach(key => {
        const room = rooms[key];
        const threat = room.metadata?.threat || 'low';
        // 'critical' rooms are bunkers (steel/concrete), others are offices (raufaser/carpet)
        roomIsBunker[key] = (threat === 'critical');
        
        if (!room.bounds) return;
        const roomW = room.bounds.w || 3;
        const roomH = room.bounds.h || 3;
        const roomX = (room.bounds.x || 0) + offsetX + roomW / 2;
        const roomZ = (room.bounds.y || 0) + offsetZ + roomH / 2;

        const floorGeo = new THREE.PlaneGeometry(roomW - 0.1, roomH - 0.1);
        const floorMat = roomIsBunker[key] ? concreteFloorMat : carpetFloorMat;
        
        const floorMesh = new THREE.Mesh(floorGeo, floorMat);
        floorMesh.rotation.x = -Math.PI / 2;
        floorMesh.position.set(roomX, 0.01, roomZ); 
        floorMesh.receiveShadow = true;
        this.mapGroup.add(floorMesh);
      });
    }

    if (grid) {
      Object.entries(grid).forEach(([key, cell]) => {
        const [cx, cy] = key.split(',').map(Number);
        const x = cx + offsetX + 0.5;
        const z = cy + offsetZ + 0.5;

        const isBunker = cell.room_id ? roomIsBunker[cell.room_id] : false;

        // Walls
        if (cell && (cell.type === 'wall' || cell.type === 'structure_wall' || cell.type === 'door_locked' || cell.type === 'door_open' || cell.type === 'breakable_wall' || cell.isWall === true)) {
          
          let wallHeight = 2.0; 
          let yOffset = wallHeight / 2;
          let mat = isBunker ? bunkerSteelMat : raufaserMat;

          if (cell.type === 'breakable_wall') {
             // Cracked concrete
             mat = new THREE.MeshStandardMaterial({ map: concreteTex, color: 0xaa5555, roughness: 0.9 });
          } else if (cell.type === 'door_locked' || cell.type === 'door_open') {
             // Heavy steel doors
             mat = bunkerSteelMat;
             if (cell.type === 'door_locked') {
                 mat = new THREE.MeshStandardMaterial({ map: steelTex, color: 0xff3333, metalness: 0.6, roughness: 0.5 });
                 wallHeight = 1.8;
                 yOffset = wallHeight / 2;
             } else {
                 wallHeight = 0.05; // open flat on ground
                 yOffset = wallHeight / 2;
             }
          }

          // Merge blocky walls by slightly scaling them up to hide seams
          const geo = new THREE.BoxGeometry(1.01, wallHeight, 1.01);
          
          // Re-map UVs to world coordinates so the texture tiles globally, not per-block!
          // This completely kills the "Minecraft" repeating block look.
          const pos = geo.attributes['position'];
          const uv = geo.attributes['uv'];
          for(let i=0; i<pos.count; i++) {
              const vx = pos.getX(i) + x;
              const vy = pos.getY(i) + yOffset;
              const vz = pos.getZ(i) + z;
              
              // Simple planar mapping based on normals
              const nx = Math.abs(geo.attributes['normal'].getX(i));
              const ny = Math.abs(geo.attributes['normal'].getY(i));
              const nz = Math.abs(geo.attributes['normal'].getZ(i));
              
              if (ny > 0.5) { uv.setXY(i, vx * 0.5, vz * 0.5); }
              else if (nx > 0.5) { uv.setXY(i, vz * 0.5, vy * 0.5); }
              else { uv.setXY(i, vx * 0.5, vy * 0.5); }
          }
          geo.attributes['uv'].needsUpdate = true;

          const wall = new THREE.Mesh(geo, mat);
          wall.position.set(x, yOffset, z);
          wall.castShadow = true;
          wall.receiveShadow = true;
          this.mapGroup.add(wall);
        }

        // Furniture
        if (cell && cell.type === 'furniture') {
          const desk = this.buildDesk(x, 0, z);
          this.mapGroup.add(desk);
        }

        if (cell && cell.type === 'cupboard') {
          const cupboard = this.buildCupboard(x, 0, z);
          this.mapGroup.add(cupboard);
        }

        if (cell && cell.type === 'server_rack') {
          const rack = this.buildServerRack(x, 0, z);
          this.mapGroup.add(rack);
        }

        // Items / Loot
        if (cell && cell.type === 'storage_box') {
          const crate = this.buildCrate(x, 0, z);
          this.mapGroup.add(crate);
        }
        
        if (cell && cell.inventory && cell.inventory.length > 0) {
          // A glowing high-tech briefcase/cache
          const cacheGeo = new THREE.BoxGeometry(0.4, 0.15, 0.3);
          const cacheMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2 });
          const cache = new THREE.Mesh(cacheGeo, cacheMat);
          
          cache.position.set(x, 0.5, z);
          cache.castShadow = true;
          
          // Glowing lock
          const lockGeo = new THREE.PlaneGeometry(0.1, 0.05);
          const lockMat = new THREE.MeshBasicMaterial({ color: 0x00ffaa });
          const lock = new THREE.Mesh(lockGeo, lockMat);
          lock.position.set(0, 0, 0.151);
          cache.add(lock);

          cache.userData = { startY: 0.5 };
          this.animatedItems.push(cache);
          this.mapGroup.add(cache);
        }
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
      const time = Date.now() * 0.003;
      this.animatedItems.forEach((item, i) => {
        item.position.y = item.userData['startY'] + Math.sin(time + i) * 0.1;
        item.rotation.y = Math.sin(time * 0.5 + i) * 0.2; // Subtle hover rotation
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

print("Updated map component to use realistic textures and complex compound furniture.")
