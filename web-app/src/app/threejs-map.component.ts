import { Component, ElementRef, Input, ViewChild, AfterViewInit, OnDestroy, effect, inject, OnChanges, SimpleChanges } from '@angular/core';
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
export class ThreeJsMapComponent implements AfterViewInit, OnDestroy, OnChanges {
  @Input() characters: Record<string, any> = {};
  @Input() sensoryData: any = {};
  @Input() mode: string = 'spectator';
  @Input() activePlayerId: string | null = null;
  @ViewChild('mapContainer') mapContainer!: ElementRef<HTMLDivElement>;

  private gridStore = inject(GridStore);

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

    // Fix WebGL Memory Leak & Context Exhaustion
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

  private updateCharacters(): void {
     if (!this.characters || !this.scene) return;

     const dim = this.gridStore.dimensions();
     const width = dim?.width || 30;
     const height = dim?.height || 30;

     const currentIds = new Set(Object.keys(this.characters));

     for (const charId of currentIds) {
         const charData = this.characters[charId];
         let mesh = this.charMeshes[charId];
         
         const x = charData.x - width / 2;
         const z = charData.y - height / 2;

         if (!mesh) {
             if (charId.startsWith('p')) {
                 const geo = new THREE.CapsuleGeometry(0.3, 0.8, 4, 16);
                 const mat = new THREE.MeshStandardMaterial({ color: 0x00aaff, roughness: 0.2, metalness: 0.8 });
                 mesh = new THREE.Mesh(geo, mat);
                 mesh.position.set(x, 0.7, z);
                 
                 // Trichter Spotlight
                 const spotLight = new THREE.SpotLight(0x00aaff, 5, 12, Math.PI / 5, 0.5, 1);
                 spotLight.position.set(0, 0.5, 0);
                 spotLight.target.position.set(0, 0, 1); // points positive Z (forward relative to mesh if rotated)
                 mesh.add(spotLight);
                 mesh.add(spotLight.target);
             } else {
                 const geo = new THREE.ConeGeometry(0.4, 1.6, 4);
                 const mat = new THREE.MeshStandardMaterial({ color: 0xff3333, roughness: 0.2, metalness: 0.8 });
                 mesh = new THREE.Mesh(geo, mat);
                 mesh.position.set(x, 0.8, z);
                 const pointLight = new THREE.PointLight(0xff3333, 1, 3);
                 pointLight.position.set(0, 1, 0);
                 mesh.add(pointLight);
             }
             
             mesh.castShadow = true;
             mesh.receiveShadow = true;
             this.scene.add(mesh);
             this.charMeshes[charId] = mesh;
         } else {
             mesh.position.set(x, charId.startsWith('p') ? 0.7 : 0.8, z);
         }
         
         // Apply rotation
         const rot = charData.rotation || 0;
         mesh.rotation.y = -(rot) + Math.PI/2;
         
         // Visibility logic based on FOV
         if (this.mode === 'player' && this.activePlayerId && charId !== this.activePlayerId) {
             const playerFov = this.sensoryData?.fov?.[this.activePlayerId] || [];
             mesh.visible = playerFov.some((c: any) => c.x === charData.x && c.y === charData.y);
         } else {
             mesh.visible = true;
         }
     }

     for (const oldId of Object.keys(this.charMeshes)) {
         if (!currentIds.has(oldId)) {
             this.scene.remove(this.charMeshes[oldId]);
             this.charMeshes[oldId].geometry.dispose();
             (this.charMeshes[oldId].material as THREE.Material).dispose();
             delete this.charMeshes[oldId];
         }
     }
  }

  private fovMeshes: THREE.Mesh[] = [];
  private vfxMeshes: THREE.Object3D[] = [];

  private renderSensoryData(): void {
      if (!this.sensoryData || !this.scene) return;
      const dim = this.gridStore.dimensions();
      const width = dim?.width || 30;
      const height = dim?.height || 30;
      const offsetX = -width / 2;
      const offsetZ = -height / 2;

      // 1. Cleanup old sensory visuals
      for (const m of this.fovMeshes) {
          this.scene.remove(m);
          if (m.geometry) m.geometry.dispose();
          if (Array.isArray(m.material)) {
              m.material.forEach((mat: any) => mat.dispose());
          } else if (m.material) {
              (m.material as any).dispose();
          }
      }
      this.fovMeshes = [];

      for (const m of this.vfxMeshes) {
          this.scene.remove(m);
          // basic cleanup
          m.traverse((child: any) => {
              if (child.geometry) child.geometry.dispose();
              if (child.material) {
                 if (Array.isArray(child.material)) child.material.forEach((mat:any)=>mat.dispose());
                 else child.material.dispose();
              }
          });
      }
      this.vfxMeshes = [];

      // 2. Render Optics (Field of View)
      if (this.sensoryData.fov && typeof this.sensoryData.fov === 'object') {
          const fovGeo = new THREE.PlaneGeometry(1, 1);
          const fovMat = new THREE.MeshBasicMaterial({ 
              color: 0xffffee, 
              transparent: true, 
              opacity: 0.15,
              depthWrite: false
          });
          
          let cellsToRender: any[] = [];
          if (this.mode === 'player' && this.activePlayerId) {
             cellsToRender = this.sensoryData.fov[this.activePlayerId] || [];
          } else {
             // GM or Spectator: combine all FOVs
             const cellSet = new Set();
             for (const pId of Object.keys(this.sensoryData.fov)) {
                if (Array.isArray(this.sensoryData.fov[pId])) {
                   for (const c of this.sensoryData.fov[pId]) {
                      const key = `${c.x},${c.y}`;
                      if (!cellSet.has(key)) {
                         cellSet.add(key);
                         cellsToRender.push(c);
                      }
                   }
                }
             }
          }
          
          for (const cell of cellsToRender) {
              const fovMesh = new THREE.Mesh(fovGeo, fovMat);
              fovMesh.rotation.x = -Math.PI / 2;
              fovMesh.position.set(cell.x + offsetX + 0.5, 0.02, cell.y + offsetZ + 0.5);
              this.scene.add(fovMesh);
              this.fovMeshes.push(fovMesh);
          }
      }

      // 3. Render Acoustics (Sound Rings + Wall Reflection Pulses)
      if (this.sensoryData.acoustics && Array.isArray(this.sensoryData.acoustics)) {
          for (const sound of this.sensoryData.acoustics) {
              const ringGeo = new THREE.RingGeometry(sound.radius - 0.2, sound.radius, 32);
              const ringMat = new THREE.MeshBasicMaterial({ color: sound.type === 'GUNFIRE' ? 0xff0000 : 0x00ffff, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
              const ring = new THREE.Mesh(ringGeo, ringMat);
              ring.rotation.x = -Math.PI / 2;
              ring.position.set(sound.x + offsetX + 0.5, 0.05, sound.y + offsetZ + 0.5);
              this.scene.add(ring);
              this.vfxMeshes.push(ring);
              
              if (sound.cells && Array.isArray(sound.cells)) {
                  const pulseGeo = new THREE.PlaneGeometry(1, 1);
                  const pulseMat = new THREE.MeshBasicMaterial({ color: sound.type === 'GUNFIRE' ? 0xaa0000 : 0x00aaaa, transparent: true, opacity: 0.2, depthWrite: false });
                  for (const cell of sound.cells) {
                      const pulse = new THREE.Mesh(pulseGeo, pulseMat);
                      pulse.rotation.x = -Math.PI / 2;
                      pulse.position.set(cell.x + offsetX + 0.5, 0.03, cell.y + offsetZ + 0.5);
                      this.scene.add(pulse);
                      this.vfxMeshes.push(pulse);
                  }
              }
          }
      }

      // 4. Render Ballistics (Lasers/Tracers)
      if (this.sensoryData.ballistics && Array.isArray(this.sensoryData.ballistics)) {
          for (const shot of this.sensoryData.ballistics) {
              if (!shot.path || shot.path.length < 2) continue;
              const points = shot.path.map((p: any) => new THREE.Vector3(p.x + offsetX + 0.5, 1.0, p.y + offsetZ + 0.5));
              if (shot.collision_point) {
                  points.push(new THREE.Vector3(shot.collision_point.x + offsetX + 0.5, 1.0, shot.collision_point.y + offsetZ + 0.5));
              }

              const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
              const lineMat = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 2 });
              const line = new THREE.Line(lineGeo, lineMat);
              this.scene.add(line);
              this.vfxMeshes.push(line);
          }
      }
  }

  private cleanMaterial(material: any) {
      material.dispose();
      for (const key of Object.keys(material)) {
          const value = material[key];
          if (value && typeof value === 'object' && 'minFilter' in value) {
              value.dispose(); // Dispose textures
          }
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


  private buildGenericProp(type: string, x: number, y: number, z: number): THREE.Group {
    const group = new THREE.Group();
    group.position.set(x, y, z);
    let mat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.6 });
    let geo: THREE.BufferGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);

    switch(type) {
      case 'chair':
        const chairBase = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), new THREE.MeshStandardMaterial({ color: 0x222222 }));
        chairBase.position.y = 0.15;
        const chairBack = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, 0.05), new THREE.MeshStandardMaterial({ color: 0x222222 }));
        chairBack.position.set(0, 0.5, -0.125);
        group.add(chairBase, chairBack);
        break;
      case 'bed':
        const bedFrame = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.2, 0.9), new THREE.MeshStandardMaterial({ color: 0x555555 }));
        bedFrame.position.y = 0.1;
        const mattress = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.1, 0.85), new THREE.MeshStandardMaterial({ color: 0xdddddd }));
        mattress.position.y = 0.25;
        group.add(bedFrame, mattress);
        break;
      case 'medical_bed':
        const medFrame = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.3, 0.9), new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.5 }));
        medFrame.position.y = 0.15;
        const medScanner = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.1, 16, 1, true, 0, Math.PI), new THREE.MeshStandardMaterial({ color: 0x00aaff, side: THREE.DoubleSide }));
        medScanner.rotation.z = Math.PI / 2;
        medScanner.position.set(0, 0.4, 0);
        group.add(medFrame, medScanner);
        break;
      case 'autodoc':
        const pod = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 0.8, 8, 16), new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.8, roughness: 0.2 }));
        pod.rotation.z = Math.PI / 2;
        pod.position.y = 0.4;
        const glass = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 0.7, 8, 16), new THREE.MeshPhysicalMaterial({ color: 0x00ffff, transmission: 0.9, opacity: 1, transparent: true }));
        glass.rotation.z = Math.PI / 2;
        glass.position.y = 0.45;
        group.add(pod, glass);
        break;
      case 'sofa':
        const sofaBase = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.2, 0.4), new THREE.MeshStandardMaterial({ color: 0x8b0000 }));
        sofaBase.position.y = 0.1;
        const sofaBack = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.3, 0.1), new THREE.MeshStandardMaterial({ color: 0x8b0000 }));
        sofaBack.position.set(0, 0.35, -0.15);
        group.add(sofaBase, sofaBack);
        break;
      case 'locker':
        const lockerGeo = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.4, 0.4), new THREE.MeshStandardMaterial({ color: 0x666666, metalness: 0.8 }));
        lockerGeo.position.y = 0.7;
        group.add(lockerGeo);
        break;
      case 'weapon_rack':
        const rackBack = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.2, 0.1), new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8 }));
        rackBack.position.set(0, 0.6, -0.15);
        const gun = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.1, 0.05), new THREE.MeshStandardMaterial({ color: 0x111111 }));
        gun.position.set(0, 0.6, -0.05);
        group.add(rackBack, gun);
        break;
      case 'ammo_crate':
        const ammo = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.3), new THREE.MeshStandardMaterial({ color: 0x4B5320, metalness: 0.3 }));
        ammo.position.y = 0.15;
        group.add(ammo);
        break;
      case 'turret':
        const tBase = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.4), new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.7 }));
        tBase.position.y = 0.2;
        const tGun = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.4), new THREE.MeshStandardMaterial({ color: 0x111111 }));
        tGun.position.set(0, 0.5, 0.1);
        group.add(tBase, tGun);
        break;
      case 'generator':
        const genBox = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.6), new THREE.MeshStandardMaterial({ color: 0xffaa00, metalness: 0.6 }));
        genBox.position.y = 0.4;
        const genCoil = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.8), new THREE.MeshBasicMaterial({ color: 0x00ffff }));
        genCoil.position.y = 0.4;
        group.add(genBox, genCoil);
        break;
      case 'table':
        const tabTop = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.05, 16), new THREE.MeshStandardMaterial({ color: 0xaaaaaa }));
        tabTop.position.y = 0.5;
        const tabLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.5), new THREE.MeshStandardMaterial({ color: 0x444444 }));
        tabLeg.position.y = 0.25;
        group.add(tabTop, tabLeg);
        break;
      case 'plant':
        const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.1, 0.3), new THREE.MeshStandardMaterial({ color: 0x8b4513 }));
        pot.position.y = 0.15;
        const leaves = new THREE.Mesh(new THREE.DodecahedronGeometry(0.2), new THREE.MeshStandardMaterial({ color: 0x228b22 }));
        leaves.position.y = 0.4;
        group.add(pot, leaves);
        break;
      case 'monitor':
        const mBase = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.05, 0.2), new THREE.MeshStandardMaterial({ color: 0x111111 }));
        mBase.position.y = 0.025;
        const mScreen = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.05), new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
        mScreen.position.set(0, 0.2, 0);
        group.add(mBase, mScreen);
        break;
      case 'bio_scanner':
        const bRing = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.05, 16, 32), new THREE.MeshStandardMaterial({ color: 0xeeeeee }));
        bRing.position.y = 0.5;
        const bLight = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.05), new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
        bLight.position.set(0, 0.5, 0.3);
        group.add(bRing, bLight);
        break;
      case 'cctv':
        const camBase = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), new THREE.MeshStandardMaterial({ color: 0x222222 }));
        camBase.position.set(0, 1.8, 0); // Wall height
        const camLens = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.15), new THREE.MeshStandardMaterial({ color: 0x000000 }));
        camLens.rotation.x = Math.PI / 4;
        camLens.position.set(0, 1.7, 0.05);
        const camLED = new THREE.Mesh(new THREE.SphereGeometry(0.02), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
        camLED.position.set(0, 1.65, 0.1);
        group.add(camBase, camLens, camLED);
        break;
      case 'tech_scrap':
        for(let i=0; i<3; i++) {
          const scrap = new THREE.Mesh(new THREE.BoxGeometry(0.1+Math.random()*0.1, 0.1, 0.1+Math.random()*0.1), new THREE.MeshStandardMaterial({ color: Math.random() > 0.5 ? 0x666666 : 0xaa5500 }));
          scrap.position.set((Math.random()-0.5)*0.4, 0.05, (Math.random()-0.5)*0.4);
          scrap.rotation.y = Math.random() * Math.PI;
          group.add(scrap);
        }
        break;
      case 'pressure_plate':
        const plate = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.02, 0.6), new THREE.MeshStandardMaterial({ color: 0x333333 }));
        plate.position.y = 0.01;
        const plateInner = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.03, 0.5), new THREE.MeshStandardMaterial({ color: 0xaa0000 }));
        plateInner.position.y = 0.015;
        group.add(plate, plateInner);
        break;
      default:
        // Generic box fallback if something else
        const fallback = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), new THREE.MeshStandardMaterial({ color: 0x888888 }));
        fallback.position.y = 0.2;
        group.add(fallback);
        break;
    }

    group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

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

  private initSharedResources(): void {
    if (this.sharedMaterials['raufaser']) return;
    
    const raufaserTex = this.createRaufaserTexture();
    const raufaserBump = this.createRaufaserBumpMap();
    const steelTex = this.createBrushedSteelTexture();
    const concreteTex = this.createConcreteTexture();
    const carpetTex = this.createCarpetTexture();

    this.sharedMaterials['raufaser'] = new THREE.MeshStandardMaterial({
        map: raufaserTex, bumpMap: raufaserBump, bumpScale: 0.05, roughness: 0.9,
    });
    this.sharedMaterials['bunkerSteel'] = new THREE.MeshStandardMaterial({
        map: steelTex, metalness: 0.8, roughness: 0.4, color: 0x888888
    });
    this.sharedMaterials['concreteFloor'] = new THREE.MeshStandardMaterial({
        map: concreteTex, roughness: 0.8
    });
    this.sharedMaterials['carpetFloor'] = new THREE.MeshStandardMaterial({
        map: carpetTex, roughness: 1.0
    });
    this.sharedMaterials['breakableWall'] = new THREE.MeshStandardMaterial({
        map: concreteTex, color: 0xaa5555, roughness: 0.9
    });
    this.sharedMaterials['doorLocked'] = new THREE.MeshStandardMaterial({
        map: steelTex, color: 0xff3333, metalness: 0.6, roughness: 0.5
    });
    this.sharedMaterials['itemMat'] = new THREE.MeshStandardMaterial({
        color: 0xFFFF00, emissive: 0xFF8800, emissiveIntensity: 0.5
    });

    this.sharedGeometries['itemBox'] = new THREE.BoxGeometry(0.3, 0.3, 0.3);
  }

  private getMapObject(key: string, createFn: () => THREE.Object3D): THREE.Object3D {
    if (this.mapMeshes.has(key)) {
        const obj = this.mapMeshes.get(key)!;
        obj.visible = true;
        return obj;
    }
    const obj = createFn();
    this.mapMeshes.set(key, obj);
    this.mapGroup.add(obj);
    return obj;
  }

  private buildMap(dimensions: { width: number, height: number } | undefined, grid: Record<string, any>, rooms: Record<string, any>): void {
    if (!dimensions || !dimensions.width) return;
    
    this.initSharedResources();

    // Hide all cached objects, we will only show those that are still needed
    this.mapMeshes.forEach(mesh => mesh.visible = false);
    this.animatedItems = [];

    const { width, height } = dimensions;
    const offsetX = -width / 2;
    const offsetZ = -height / 2;

    // Default global floor (concrete foundation)
    const base = this.getMapObject('base_floor', () => {
        const baseGeo = new THREE.BoxGeometry(width + 2, 0.5, height + 2);
        const m = new THREE.Mesh(baseGeo, this.sharedMaterials['concreteFloor']);
        m.receiveShadow = true;
        return m;
    });
    base.position.set(0, -0.25, 0);
    if (base instanceof THREE.Mesh && base.geometry.parameters && (base.geometry.parameters.width !== width + 2 || base.geometry.parameters.depth !== height + 2)) {
        base.geometry.dispose();
        base.geometry = new THREE.BoxGeometry(width + 2, 0.5, height + 2);
    }

    // Determine room properties
    const roomIsBunker: Record<string, boolean> = {};
    if (rooms) {
      Object.keys(rooms).forEach(key => {
        const room = rooms[key];
        const threat = room.metadata?.threat || 'low';
        roomIsBunker[key] = (threat === 'critical');
        
        if (!room.bounds) return;
        const roomW = room.bounds.w || 3;
        const roomH = room.bounds.h || 3;
        const roomX = (room.bounds.x || 0) + offsetX + roomW / 2;
        const roomZ = (room.bounds.y || 0) + offsetZ + roomH / 2;

        const floorMesh = this.getMapObject(`room_floor_${key}`, () => {
            const floorGeo = new THREE.PlaneGeometry(roomW - 0.1, roomH - 0.1);
            const floorMat = roomIsBunker[key] ? this.sharedMaterials['concreteFloor'] : this.sharedMaterials['carpetFloor'];
            const m = new THREE.Mesh(floorGeo, floorMat);
            m.rotation.x = -Math.PI / 2;
            m.receiveShadow = true;
            return m;
        });
        floorMesh.position.set(roomX, 0.01, roomZ); 
        if (floorMesh instanceof THREE.Mesh && floorMesh.geometry.parameters && (floorMesh.geometry.parameters.width !== roomW - 0.1 || floorMesh.geometry.parameters.height !== roomH - 0.1)) {
            floorMesh.geometry.dispose();
            floorMesh.geometry = new THREE.PlaneGeometry(roomW - 0.1, roomH - 0.1);
        }
      });
    }

    if (grid) {
      Object.entries(grid).forEach(([key, cell]) => {
        const [cx, cy] = key.split(',').map(Number);
        const x = cx + offsetX + 0.5;
        const z = cy + offsetZ + 0.5;

        const isBunker = cell.roomId ? roomIsBunker[cell.roomId] : false;

        // Walls
        if (cell && (cell.type === 'wall' || cell.type === 'structure_wall' || cell.type === 'door_locked' || cell.type === 'door_open' || cell.type === 'breakable_wall' || cell.isWall === true)) {
          
          let wallHeight = 2.0; 
          let yOffset = wallHeight / 2;
          let mat = isBunker ? this.sharedMaterials['bunkerSteel'] : this.sharedMaterials['raufaser'];

          if (cell.type === 'breakable_wall') {
             mat = this.sharedMaterials['breakableWall'];
          } else if (cell.type === 'door_locked' || cell.type === 'door_open') {
             mat = this.sharedMaterials['bunkerSteel'];
             if (cell.type === 'door_locked') {
                 mat = this.sharedMaterials['doorLocked'];
                 wallHeight = 1.8;
                 yOffset = wallHeight / 2;
             } else {
                 wallHeight = 0.05; 
                 yOffset = wallHeight / 2;
             }
          }

          const wallKey = `wall_${key}`;
          const mesh = this.getMapObject(wallKey, () => {
             const geo = new THREE.BoxGeometry(1.01, wallHeight, 1.01);
             const pos = geo.attributes['position'];
             const uv = geo.attributes['uv'];
             
             for (let i = 0; i < pos.count; i++) {
               const px = pos.getX(i) + x;
               const py = pos.getY(i) + yOffset;
               const pz = pos.getZ(i) + z;

               let nx = Math.abs(pos.getX(i));
               let ny = Math.abs(pos.getY(i));
               let nz = Math.abs(pos.getZ(i));

               if (ny > 0.49) {
                   uv.setXY(i, px * 0.2, pz * 0.2);
               } else if (nx > 0.49) {
                   uv.setXY(i, pz * 0.2, py * 0.2);
               } else if (nz > 0.49) {
                   uv.setXY(i, px * 0.2, py * 0.2);
               }
             }

             const m = new THREE.Mesh(geo, mat);
             m.castShadow = true;
             m.receiveShadow = true;
             return m;
          });
          
          mesh.position.set(x, yOffset, z);
          if (mesh instanceof THREE.Mesh) {
              mesh.material = mat;
              if (mesh.geometry.parameters && mesh.geometry.parameters.height !== wallHeight) {
                  mesh.geometry.dispose();
                  const geo = new THREE.BoxGeometry(1.01, wallHeight, 1.01);
                  const pos = geo.attributes['position'];
                  const uv = geo.attributes['uv'];
                  for (let i = 0; i < pos.count; i++) {
                     const px = pos.getX(i) + x;
                     const py = pos.getY(i) + yOffset;
                     const pz = pos.getZ(i) + z;
                     let nx = Math.abs(pos.getX(i)); let ny = Math.abs(pos.getY(i)); let nz = Math.abs(pos.getZ(i));
                     if (ny > 0.49) uv.setXY(i, px * 0.2, pz * 0.2);
                     else if (nx > 0.49) uv.setXY(i, pz * 0.2, py * 0.2);
                     else if (nz > 0.49) uv.setXY(i, px * 0.2, py * 0.2);
                  }
                  mesh.geometry = geo;
              }
          }
        } else if (cell.type === 'street' || cell.type === 'grass' || cell.type === 'water') {
            // ...
        } else {
            const propMap: Record<string, string> = {
                'server_rack': 'server_rack', 'cupboard': 'cupboard', 'storage_box': 'crate',
                'furniture': 'desk', 'medical_bed': 'medical_bed', 'autodoc': 'autodoc',
                'bio_scanner': 'bio_scanner', 'chair': 'chair', 'bed': 'bed', 'sofa': 'sofa',
                'locker': 'locker', 'weapon_rack': 'weapon_rack', 'ammo_crate': 'ammo_crate',
                'turret': 'turret', 'generator': 'generator', 'table': 'table', 'plant': 'plant',
                'monitor': 'monitor', 'cctv': 'cctv', 'pressure_plate': 'pressure_plate', 'tech_scrap': 'tech_scrap'
            };

            if (propMap[cell.type]) {
                const propKey = `prop_${key}_${propMap[cell.type]}`;
                const group = this.getMapObject(propKey, () => {
                    if (propMap[cell.type] === 'desk') return this.buildDesk(x, 0, z);
                    if (propMap[cell.type] === 'server_rack') return this.buildServerRack(x, 0, z);
                    if (propMap[cell.type] === 'cupboard') return this.buildCupboard(x, 0, z);
                    if (propMap[cell.type] === 'crate') return this.buildCrate(x, 0, z);
                    return this.buildGenericProp(cell.type, x, 0, z);
                });
                group.position.set(x, 0, z);
            }
            
            if (cell.inventory && Array.isArray(cell.inventory) && cell.inventory.length > 0) {
               const itemKey = `item_${key}`;
               const itemBox = this.getMapObject(itemKey, () => {
                  const m = new THREE.Mesh(this.sharedGeometries['itemBox'], this.sharedMaterials['itemMat']);
                  m.castShadow = true;
                  m.userData['startY'] = 0.15;
                  return m;
               });
               itemBox.position.set(x, 0.15, z);
               if (itemBox instanceof THREE.Mesh) this.animatedItems.push(itemBox);
            }
        }
      });
    }
    const maxDimension = Math.max(width, height);
    const distance = (maxDimension / 2) / Math.tan(Math.PI / 8);
    this.camera.position.set(distance * 0.7, distance * 0.8, distance * 0.7);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
    
    this.updateCharacters();
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
    
    // Throttle rendering to ~60 FPS max
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
