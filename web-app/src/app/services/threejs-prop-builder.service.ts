import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { ThreeJsTextureService } from './threejs-texture.service';

@Injectable({ providedIn: 'root' })
export class ThreeJsPropBuilderService {
  private textureService = inject(ThreeJsTextureService);

  buildDesk(x: number, y: number, z: number): THREE.Group {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    const topGeo = new THREE.BoxGeometry(0.8, 0.05, 0.5);
    const topMat = new THREE.MeshStandardMaterial({ map: this.textureService.createWoodTexture(), roughness: 0.8 });
    const top = new THREE.Mesh(topGeo, topMat);
    top.position.set(0, 0.7, 0);
    top.castShadow = true;
    top.receiveShadow = true;
    group.add(top);

    const legGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.7, 8);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.8, roughness: 0.3 });
    const positions = [[-0.35, 0.35, -0.2], [0.35, 0.35, -0.2], [-0.35, 0.35, 0.2], [0.35, 0.35, 0.2]];
    positions.forEach(pos => {
        const leg = new THREE.Mesh(legGeo, legMat);
        leg.position.set(pos[0], pos[1], pos[2]);
        leg.castShadow = true;
        group.add(leg);
    });

    const monitorGeo = new THREE.BoxGeometry(0.3, 0.2, 0.05);
    const monitorMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2 });
    const monitor = new THREE.Mesh(monitorGeo, monitorMat);
    monitor.position.set(0, 0.825, -0.1);
    monitor.castShadow = true;
    group.add(monitor);

    const screenGeo = new THREE.PlaneGeometry(0.28, 0.18);
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(0, 0.825, -0.074);
    group.add(screen);

    return group;
  }

  buildServerRack(x: number, y: number, z: number): THREE.Group {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    const rackGeo = new THREE.BoxGeometry(0.7, 1.8, 0.7);
    const steelTex = this.textureService.createBrushedSteelTexture();
    const rackMat = new THREE.MeshStandardMaterial({ map: steelTex, metalness: 0.9, roughness: 0.4 });
    const rack = new THREE.Mesh(rackGeo, rackMat);
    rack.position.set(0, 0.9, 0);
    rack.castShadow = true;
    rack.receiveShadow = true;
    group.add(rack);

    for(let i=0; i<8; i++) {
        const ledGeo = new THREE.BoxGeometry(0.4, 0.02, 0.72);
        const ledMat = new THREE.MeshBasicMaterial({ color: Math.random() > 0.5 ? 0x00ff00 : 0x0088ff });
        const led = new THREE.Mesh(ledGeo, ledMat);
        led.position.set(0, 0.4 + (i * 0.15), 0);
        group.add(led);
    }
    return group;
  }

  buildCupboard(x: number, y: number, z: number): THREE.Group {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    const boxGeo = new THREE.BoxGeometry(0.8, 1.6, 0.6);
    const boxMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.position.set(0, 0.8, 0);
    box.castShadow = true;
    box.receiveShadow = true;
    group.add(box);

    const handleGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.4);
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.9 });
    const handle1 = new THREE.Mesh(handleGeo, handleMat);
    handle1.position.set(-0.05, 0.8, 0.31);
    const handle2 = new THREE.Mesh(handleGeo, handleMat);
    handle2.position.set(0.05, 0.8, 0.31);
    group.add(handle1, handle2);

    return group;
  }

  buildCrate(x: number, y: number, z: number): THREE.Group {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    const boxGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const boxMat = new THREE.MeshStandardMaterial({ map: this.textureService.createBrushedSteelTexture(), metalness: 0.8, roughness: 0.5 });
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.position.set(0, 0.25, 0);
    box.castShadow = true;
    box.receiveShadow = true;
    group.add(box);

    const accentGeo = new THREE.BoxGeometry(0.52, 0.05, 0.52);
    const accentMat = new THREE.MeshStandardMaterial({ color: 0xff6600, roughness: 0.8 });
    const accent1 = new THREE.Mesh(accentGeo, accentMat);
    accent1.position.set(0, 0.1, 0);
    const accent2 = new THREE.Mesh(accentGeo, accentMat);
    accent2.position.set(0, 0.4, 0);
    group.add(accent1, accent2);

    return group;
  }

  private addBaseProp(group: THREE.Group, type: string) {
    if (type === 'chair') {
      const chairBase = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), new THREE.MeshStandardMaterial({ color: 0x222222 }));
      chairBase.position.y = 0.15;
      const chairBack = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, 0.05), new THREE.MeshStandardMaterial({ color: 0x222222 }));
      chairBack.position.set(0, 0.5, -0.125);
      group.add(chairBase, chairBack);
    } else if (type === 'bed') {
      const bedFrame = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.2, 0.9), new THREE.MeshStandardMaterial({ color: 0x555555 }));
      bedFrame.position.y = 0.1;
      const mattress = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.1, 0.85), new THREE.MeshStandardMaterial({ color: 0xdddddd }));
      mattress.position.y = 0.25;
      group.add(bedFrame, mattress);
    } else if (type === 'medical_bed') {
      const medFrame = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.3, 0.9), new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.5 }));
      medFrame.position.y = 0.15;
      const medScanner = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.1, 16, 1, true, 0, Math.PI), new THREE.MeshStandardMaterial({ color: 0x00aaff, side: THREE.DoubleSide }));
      medScanner.rotation.z = Math.PI / 2;
      medScanner.position.set(0, 0.4, 0);
      group.add(medFrame, medScanner);
    } else if (type === 'autodoc') {
      const pod = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 0.8, 8, 16), new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.8, roughness: 0.2 }));
      pod.rotation.z = Math.PI / 2;
      pod.position.y = 0.4;
      const glass = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 0.7, 8, 16), new THREE.MeshPhysicalMaterial({ color: 0x00ffff, transmission: 0.9, opacity: 1, transparent: true }));
      glass.rotation.z = Math.PI / 2;
      glass.position.y = 0.45;
      group.add(pod, glass);
    } else {
      this.addMoreProps(group, type);
    }
  }

  private addMoreProps(group: THREE.Group, type: string) {
    if (type === 'sofa') {
      const sofaBase = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.2, 0.4), new THREE.MeshStandardMaterial({ color: 0x8b0000 }));
      sofaBase.position.y = 0.1;
      const sofaBack = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.3, 0.1), new THREE.MeshStandardMaterial({ color: 0x8b0000 }));
      sofaBack.position.set(0, 0.35, -0.15);
      group.add(sofaBase, sofaBack);
    } else if (type === 'locker') {
      const lockerGeo = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.4, 0.4), new THREE.MeshStandardMaterial({ color: 0x666666, metalness: 0.8 }));
      lockerGeo.position.y = 0.7;
      group.add(lockerGeo);
    } else if (type === 'weapon_rack') {
      const rackBack = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.2, 0.1), new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8 }));
      rackBack.position.set(0, 0.6, -0.15);
      const gun = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.1, 0.05), new THREE.MeshStandardMaterial({ color: 0x111111 }));
      gun.position.set(0, 0.6, -0.05);
      group.add(rackBack, gun);
    } else if (type === 'ammo_crate') {
      const ammo = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.3), new THREE.MeshStandardMaterial({ color: 0x4B5320, metalness: 0.3 }));
      ammo.position.y = 0.15;
      group.add(ammo);
    } else {
      this.addMiscProps(group, type);
    }
  }

  private addMiscProps(group: THREE.Group, type: string) {
    if (type === 'turret') {
      const tBase = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.4), new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.7 }));
      tBase.position.y = 0.2;
      const tGun = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.4), new THREE.MeshStandardMaterial({ color: 0x111111 }));
      tGun.position.set(0, 0.5, 0.1);
      group.add(tBase, tGun);
    } else if (type === 'generator') {
      const genBox = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.6), new THREE.MeshStandardMaterial({ color: 0xffaa00, metalness: 0.6 }));
      genBox.position.y = 0.4;
      const genCoil = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.8), new THREE.MeshBasicMaterial({ color: 0x00ffff }));
      genCoil.position.y = 0.4;
      group.add(genBox, genCoil);
    } else if (type === 'table') {
      const tabTop = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.05, 16), new THREE.MeshStandardMaterial({ color: 0xaaaaaa }));
      tabTop.position.y = 0.5;
      const tabLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.5), new THREE.MeshStandardMaterial({ color: 0x444444 }));
      tabLeg.position.y = 0.25;
      group.add(tabTop, tabLeg);
    } else if (type === 'plant') {
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.1, 0.3), new THREE.MeshStandardMaterial({ color: 0x8b4513 }));
      pot.position.y = 0.15;
      const leaves = new THREE.Mesh(new THREE.DodecahedronGeometry(0.2), new THREE.MeshStandardMaterial({ color: 0x228b22 }));
      leaves.position.y = 0.4;
      group.add(pot, leaves);
    } else {
      this.addTechProps(group, type);
    }
  }

  private addTechProps(group: THREE.Group, type: string) {
    if (type === 'monitor') {
      const mBase = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.05, 0.2), new THREE.MeshStandardMaterial({ color: 0x111111 }));
      mBase.position.y = 0.025;
      const mScreen = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.05), new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
      mScreen.position.set(0, 0.2, 0);
      group.add(mBase, mScreen);
    } else if (type === 'bio_scanner') {
      const bRing = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.05, 16, 32), new THREE.MeshStandardMaterial({ color: 0xeeeeee }));
      bRing.position.y = 0.5;
      const bLight = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.05), new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
      bLight.position.set(0, 0.5, 0.3);
      group.add(bRing, bLight);
    } else if (type === 'cctv') {
      const camBase = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), new THREE.MeshStandardMaterial({ color: 0x222222 }));
      camBase.position.set(0, 1.8, 0);
      const camLens = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.15), new THREE.MeshStandardMaterial({ color: 0x000000 }));
      camLens.rotation.x = Math.PI / 4;
      camLens.position.set(0, 1.7, 0.05);
      const camLED = new THREE.Mesh(new THREE.SphereGeometry(0.02), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
      camLED.position.set(0, 1.65, 0.1);
      group.add(camBase, camLens, camLED);
    } else if (type === 'tech_scrap') {
      for(let i=0; i<3; i++) {
        const scrap = new THREE.Mesh(new THREE.BoxGeometry(0.1+Math.random()*0.1, 0.1, 0.1+Math.random()*0.1), new THREE.MeshStandardMaterial({ color: Math.random() > 0.5 ? 0x666666 : 0xaa5500 }));
        scrap.position.set((Math.random()-0.5)*0.4, 0.05, (Math.random()-0.5)*0.4);
        scrap.rotation.y = Math.random() * Math.PI;
        group.add(scrap);
      }
    } else if (type === 'pressure_plate') {
      const plate = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.02, 0.6), new THREE.MeshStandardMaterial({ color: 0x333333 }));
      plate.position.y = 0.01;
      const plateInner = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.03, 0.5), new THREE.MeshStandardMaterial({ color: 0xaa0000 }));
      plateInner.position.y = 0.015;
      group.add(plate, plateInner);
    } else {
      const fallback = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), new THREE.MeshStandardMaterial({ color: 0x888888 }));
      fallback.position.y = 0.2;
      group.add(fallback);
    }
  }

  buildGenericProp(type: string, x: number, y: number, z: number): THREE.Group {
    const group = new THREE.Group();
    group.position.set(x, y, z);
    
    this.addBaseProp(group, type);

    group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    return group;
  }
}
