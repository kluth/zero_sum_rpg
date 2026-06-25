import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { ThreeJsPropBuilderService } from './threejs-prop-builder.service';
import { ThreeJsTextureService } from './threejs-texture.service';

@Injectable({ providedIn: 'root' })
export class ThreeJsRendererService {
  private propBuilder = inject(ThreeJsPropBuilderService);
  private textureService = inject(ThreeJsTextureService);

  initSharedResources(sharedMaterials: Record<string, THREE.Material>, sharedGeometries: Record<string, THREE.BufferGeometry>): void {
    if (sharedMaterials['raufaser']) return;
    
    const raufaserTex = this.textureService.createRaufaserTexture();
    const raufaserBump = this.textureService.createRaufaserBumpMap();
    const steelTex = this.textureService.createBrushedSteelTexture();
    const concreteTex = this.textureService.createConcreteTexture();
    const carpetTex = this.textureService.createCarpetTexture();

    sharedMaterials['raufaser'] = new THREE.MeshStandardMaterial({ map: raufaserTex, bumpMap: raufaserBump, bumpScale: 0.05, roughness: 0.9 });
    sharedMaterials['bunkerSteel'] = new THREE.MeshStandardMaterial({ map: steelTex, metalness: 0.8, roughness: 0.4, color: 0x888888 });
    sharedMaterials['concreteFloor'] = new THREE.MeshStandardMaterial({ map: concreteTex, roughness: 0.8 });
    sharedMaterials['carpetFloor'] = new THREE.MeshStandardMaterial({ map: carpetTex, roughness: 1.0 });
    sharedMaterials['breakableWall'] = new THREE.MeshStandardMaterial({ map: concreteTex, color: 0xaa5555, roughness: 0.9 });
    sharedMaterials['doorLocked'] = new THREE.MeshStandardMaterial({ map: steelTex, color: 0xff3333, metalness: 0.6, roughness: 0.5 });
    sharedMaterials['itemMat'] = new THREE.MeshStandardMaterial({ color: 0xFFFF00, emissive: 0xFF8800, emissiveIntensity: 0.5 });

    sharedGeometries['itemBox'] = new THREE.BoxGeometry(0.3, 0.3, 0.3);
  }

  getMapObject(mapMeshes: Map<string, THREE.Object3D>, mapGroup: THREE.Group, key: string, createFn: () => THREE.Object3D): THREE.Object3D {
    if (mapMeshes.has(key)) {
        const obj = mapMeshes.get(key)!;
        obj.visible = true;
        return obj;
    }
    const obj = createFn();
    mapMeshes.set(key, obj);
    mapGroup.add(obj);
    return obj;
  }

  private buildRoomFloors(rooms: Record<string, any>, offsetX: number, offsetZ: number, sharedMaterials: Record<string, THREE.Material>, roomIsBunker: Record<string, boolean>, mapMeshes: Map<string, THREE.Object3D>, mapGroup: THREE.Group) {
    if (!rooms) return;
    Object.keys(rooms).forEach(key => {
      const room = rooms[key];
      const threat = room.metadata?.threat || 'low';
      roomIsBunker[key] = (threat === 'critical');
      
      if (!room.bounds) return;
      const roomW = room.bounds.w || 3;
      const roomH = room.bounds.h || 3;
      const roomX = (room.bounds.x || 0) + offsetX + roomW / 2;
      const roomZ = (room.bounds.y || 0) + offsetZ + roomH / 2;

      const floorMesh = this.getMapObject(mapMeshes, mapGroup, `room_floor_${key}`, () => {
          const floorGeo = new THREE.PlaneGeometry(roomW - 0.1, roomH - 0.1);
          const floorMat = roomIsBunker[key] ? sharedMaterials['concreteFloor'] : sharedMaterials['carpetFloor'];
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

  private buildWallCell(cell: any, x: number, z: number, key: string, isBunker: boolean, sharedMaterials: Record<string, THREE.Material>, mapMeshes: Map<string, THREE.Object3D>, mapGroup: THREE.Group) {
      let wallHeight = 2.0; 
      let yOffset = wallHeight / 2;
      let mat = isBunker ? sharedMaterials['bunkerSteel'] : sharedMaterials['raufaser'];

      if (cell.type === 'breakable_wall') {
         mat = sharedMaterials['breakableWall'];
      } else if (cell.type === 'door_locked' || cell.type === 'door_open') {
         mat = sharedMaterials['bunkerSteel'];
         if (cell.type === 'door_locked') {
             mat = sharedMaterials['doorLocked'];
             wallHeight = 1.8;
             yOffset = wallHeight / 2;
         } else {
             wallHeight = 0.05; 
             yOffset = wallHeight / 2;
         }
      }

      const wallKey = `wall_${key}`;
      const mesh = this.getMapObject(mapMeshes, mapGroup, wallKey, () => {
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
                 const px = pos.getX(i) + x; const py = pos.getY(i) + yOffset; const pz = pos.getZ(i) + z;
                 let nx = Math.abs(pos.getX(i)); let ny = Math.abs(pos.getY(i)); let nz = Math.abs(pos.getZ(i));
                 if (ny > 0.49) uv.setXY(i, px * 0.2, pz * 0.2);
                 else if (nx > 0.49) uv.setXY(i, pz * 0.2, py * 0.2);
                 else if (nz > 0.49) uv.setXY(i, px * 0.2, py * 0.2);
              }
              mesh.geometry = geo;
          }
      }
  }

  private buildPropCell(cell: any, x: number, z: number, key: string, mapMeshes: Map<string, THREE.Object3D>, mapGroup: THREE.Group, animatedItems: THREE.Mesh[], sharedMaterials: Record<string, THREE.Material>, sharedGeometries: Record<string, THREE.BufferGeometry>) {
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
          const group = this.getMapObject(mapMeshes, mapGroup, propKey, () => {
              if (propMap[cell.type] === 'desk') return this.propBuilder.buildDesk(x, 0, z);
              if (propMap[cell.type] === 'server_rack') return this.propBuilder.buildServerRack(x, 0, z);
              if (propMap[cell.type] === 'cupboard') return this.propBuilder.buildCupboard(x, 0, z);
              if (propMap[cell.type] === 'crate') return this.propBuilder.buildCrate(x, 0, z);
              return this.propBuilder.buildGenericProp(cell.type, x, 0, z);
          });
          group.position.set(x, 0, z);
      }
      
      if (cell.inventory && Array.isArray(cell.inventory) && cell.inventory.length > 0) {
         const itemKey = `item_${key}`;
         const itemBox = this.getMapObject(mapMeshes, mapGroup, itemKey, () => {
            const m = new THREE.Mesh(sharedGeometries['itemBox'], sharedMaterials['itemMat']);
            m.castShadow = true;
            m.userData['startY'] = 0.15;
            return m;
         });
         itemBox.position.set(x, 0.15, z);
         if (itemBox instanceof THREE.Mesh) animatedItems.push(itemBox);
      }
  }

  buildMap(
    scene: THREE.Scene,
    mapGroup: THREE.Group,
    dimensions: any,
    grid: any,
    rooms: any,
    sharedMaterials: Record<string, THREE.Material>,
    sharedGeometries: Record<string, THREE.BufferGeometry>,
    mapMeshes: Map<string, THREE.Object3D>,
    animatedItems: THREE.Mesh[],
    camera: THREE.PerspectiveCamera,
    controls: any
  ) {
    if (!dimensions || !dimensions.width) return;
    this.initSharedResources(sharedMaterials, sharedGeometries);
    mapMeshes.forEach(mesh => mesh.visible = false);
    
    // Note: animatedItems array reference should be modified or handled carefully.
    // We assume the caller passes a reference that we mutate. In TS, reassigning won't work.
    animatedItems.length = 0;

    const { width, height } = dimensions;
    const offsetX = -width / 2;
    const offsetZ = -height / 2;

    const base = this.getMapObject(mapMeshes, mapGroup, 'base_floor', () => {
        const baseGeo = new THREE.BoxGeometry(width + 2, 0.5, height + 2);
        const m = new THREE.Mesh(baseGeo, sharedMaterials['concreteFloor']);
        m.receiveShadow = true;
        return m;
    });
    base.position.set(0, -0.25, 0);
    if (base instanceof THREE.Mesh && base.geometry.parameters && (base.geometry.parameters.width !== width + 2 || base.geometry.parameters.depth !== height + 2)) {
        base.geometry.dispose();
        base.geometry = new THREE.BoxGeometry(width + 2, 0.5, height + 2);
    }

    const roomIsBunker: Record<string, boolean> = {};
    this.buildRoomFloors(rooms, offsetX, offsetZ, sharedMaterials, roomIsBunker, mapMeshes, mapGroup);

    if (grid) {
      Object.entries(grid).forEach(([key, cell]: [string, any]) => {
        const [cx, cy] = key.split(',').map(Number);
        const x = cx + offsetX + 0.5;
        const z = cy + offsetZ + 0.5;
        const isBunker = cell.roomId ? roomIsBunker[cell.roomId] : false;

        if (cell && (cell.type === 'wall' || cell.type === 'structure_wall' || cell.type === 'door_locked' || cell.type === 'door_open' || cell.type === 'breakable_wall' || cell.isWall === true)) {
          this.buildWallCell(cell, x, z, key, isBunker, sharedMaterials, mapMeshes, mapGroup);
        } else if (cell.type === 'street' || cell.type === 'grass' || cell.type === 'water') {
            // ...
        } else {
          this.buildPropCell(cell, x, z, key, mapMeshes, mapGroup, animatedItems, sharedMaterials, sharedGeometries);
        }
      });
    }

    const maxDimension = Math.max(width, height);
    const distance = (maxDimension / 2) / Math.tan(Math.PI / 8);
    camera.position.set(distance * 0.7, distance * 0.8, distance * 0.7);
    controls.target.set(0, 0, 0);
    controls.update();
  }

  updateCharacters(
    scene: THREE.Scene,
    characters: Record<string, any>,
    charMeshes: Record<string, THREE.Mesh>,
    mode: string,
    activePlayerId: string | null,
    sensoryData: any,
    dim: any
  ) {
     if (!characters || !scene) return;
     const width = dim?.width || 30;
     const height = dim?.height || 30;
     const currentIds = new Set(Object.keys(characters));

     for (const charId of currentIds) {
         const charData = characters[charId];
         let mesh = charMeshes[charId];
         const x = charData.x - width / 2;
         const z = charData.y - height / 2;

         if (!mesh) {
             if (charId.startsWith('p')) {
                 mesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 0.8, 4, 16), new THREE.MeshStandardMaterial({ color: 0x00aaff, roughness: 0.2, metalness: 0.8 }));
                 mesh.position.set(x, 0.7, z);
                 const spotLight = new THREE.SpotLight(0x00aaff, 5, 12, Math.PI / 5, 0.5, 1);
                 spotLight.position.set(0, 0.5, 0);
                 spotLight.target.position.set(0, 0, 1);
                 mesh.add(spotLight, spotLight.target);
             } else {
                 mesh = new THREE.Mesh(new THREE.ConeGeometry(0.4, 1.6, 4), new THREE.MeshStandardMaterial({ color: 0xff3333, roughness: 0.2, metalness: 0.8 }));
                 mesh.position.set(x, 0.8, z);
                 const pointLight = new THREE.PointLight(0xff3333, 1, 3);
                 pointLight.position.set(0, 1, 0);
                 mesh.add(pointLight);
             }
             mesh.castShadow = true;
             mesh.receiveShadow = true;
             scene.add(mesh);
             charMeshes[charId] = mesh;
         } else {
             mesh.position.set(x, charId.startsWith('p') ? 0.7 : 0.8, z);
         }
         
         const rot = charData.rotation || 0;
         mesh.rotation.y = -(rot) + Math.PI/2;
         
         if (mode === 'player' && activePlayerId && charId !== activePlayerId) {
             const playerFov = sensoryData?.fov?.[activePlayerId] || [];
             mesh.visible = playerFov.some((c: any) => c.x === charData.x && c.y === charData.y);
         } else {
             mesh.visible = true;
         }
     }

     for (const oldId of Object.keys(charMeshes)) {
         if (!currentIds.has(oldId)) {
             scene.remove(charMeshes[oldId]);
             charMeshes[oldId].geometry.dispose();
             (charMeshes[oldId].material as THREE.Material).dispose();
             delete charMeshes[oldId];
         }
     }
  }

  private renderOptics(scene: THREE.Scene, sensoryData: any, mode: string, activePlayerId: string | null, fovMeshes: THREE.Mesh[], offsetX: number, offsetZ: number) {
      if (sensoryData.fov && typeof sensoryData.fov === 'object') {
          const fovGeo = new THREE.PlaneGeometry(1, 1);
          const fovMat = new THREE.MeshBasicMaterial({ color: 0xffffee, transparent: true, opacity: 0.15, depthWrite: false });
          let cellsToRender: any[] = [];
          
          if (mode === 'player' && activePlayerId) {
             cellsToRender = sensoryData.fov[activePlayerId] || [];
          } else {
             const cellSet = new Set();
             for (const pId of Object.keys(sensoryData.fov)) {
                if (Array.isArray(sensoryData.fov[pId])) {
                   for (const c of sensoryData.fov[pId]) {
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
              scene.add(fovMesh);
              fovMeshes.push(fovMesh);
          }
      }
  }

  private renderAcousticsAndBallistics(scene: THREE.Scene, sensoryData: any, vfxMeshes: THREE.Object3D[], offsetX: number, offsetZ: number) {
      if (sensoryData.acoustics && Array.isArray(sensoryData.acoustics)) {
          for (const sound of sensoryData.acoustics) {
              const ringGeo = new THREE.RingGeometry(sound.radius - 0.2, sound.radius, 32);
              const ringMat = new THREE.MeshBasicMaterial({ color: sound.type === 'GUNFIRE' ? 0xff0000 : 0x00ffff, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
              const ring = new THREE.Mesh(ringGeo, ringMat);
              ring.rotation.x = -Math.PI / 2;
              ring.position.set(sound.x + offsetX + 0.5, 0.05, sound.y + offsetZ + 0.5);
              scene.add(ring);
              vfxMeshes.push(ring);
              
              if (sound.cells && Array.isArray(sound.cells)) {
                  const pulseGeo = new THREE.PlaneGeometry(1, 1);
                  const pulseMat = new THREE.MeshBasicMaterial({ color: sound.type === 'GUNFIRE' ? 0xaa0000 : 0x00aaaa, transparent: true, opacity: 0.2, depthWrite: false });
                  for (const cell of sound.cells) {
                      const pulse = new THREE.Mesh(pulseGeo, pulseMat);
                      pulse.rotation.x = -Math.PI / 2;
                      pulse.position.set(cell.x + offsetX + 0.5, 0.03, cell.y + offsetZ + 0.5);
                      scene.add(pulse);
                      vfxMeshes.push(pulse);
                  }
              }
          }
      }
      if (sensoryData.ballistics && Array.isArray(sensoryData.ballistics)) {
          for (const shot of sensoryData.ballistics) {
              if (!shot.path || shot.path.length < 2) continue;
              const points = shot.path.map((p: any) => new THREE.Vector3(p.x + offsetX + 0.5, 1.0, p.y + offsetZ + 0.5));
              if (shot.collision_point) points.push(new THREE.Vector3(shot.collision_point.x + offsetX + 0.5, 1.0, shot.collision_point.y + offsetZ + 0.5));
              const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
              const lineMat = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 2 });
              const line = new THREE.Line(lineGeo, lineMat);
              scene.add(line);
              vfxMeshes.push(line);
          }
      }
  }

  renderSensoryData(
    scene: THREE.Scene,
    sensoryData: any,
    mode: string,
    activePlayerId: string | null,
    fovMeshes: THREE.Mesh[],
    vfxMeshes: THREE.Object3D[],
    dim: any
  ) {
      if (!sensoryData || !scene) return;
      const width = dim?.width || 30;
      const height = dim?.height || 30;
      const offsetX = -width / 2;
      const offsetZ = -height / 2;

      for (const m of fovMeshes) {
          scene.remove(m);
          if (m.geometry) m.geometry.dispose();
          if (Array.isArray(m.material)) m.material.forEach((mat: any) => mat.dispose());
          else if (m.material) (m.material as any).dispose();
      }
      fovMeshes.length = 0;

      for (const m of vfxMeshes) {
          scene.remove(m);
          m.traverse((child: any) => {
              if (child.geometry) child.geometry.dispose();
              if (child.material) {
                 if (Array.isArray(child.material)) child.material.forEach((mat:any)=>mat.dispose());
                 else child.material.dispose();
              }
          });
      }
      vfxMeshes.length = 0;

      this.renderOptics(scene, sensoryData, mode, activePlayerId, fovMeshes, offsetX, offsetZ);
      this.renderAcousticsAndBallistics(scene, sensoryData, vfxMeshes, offsetX, offsetZ);
  }
}
