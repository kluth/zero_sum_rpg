import re

with open('/home/matthias/project/zero_sum_rpg/web-app/src/app/threejs-map.component.ts', 'r') as f:
    code = f.read()

# 1. Insert buildGenericProp just before initThreeJs()
generic_builder = """
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
"""

code = code.replace("  private initThreeJs(): void {", generic_builder)

# 2. Replace the giant furniture switch
furniture_block_regex = re.compile(r'// Furniture.*?// Items / Loot', re.DOTALL)
replacement_block = """// Furniture and Items
        if (cell) {
          if (cell.type === 'furniture') {
            const prop = this.buildDesk(x, 0, z);
            this.mapGroup.add(prop);
          } else if (cell.type === 'cupboard') {
            const prop = this.buildCupboard(x, 0, z);
            this.mapGroup.add(prop);
          } else if (cell.type === 'server_rack') {
            const prop = this.buildServerRack(x, 0, z);
            this.mapGroup.add(prop);
          } else if (cell.type === 'storage_box') {
            const prop = this.buildCrate(x, 0, z);
            this.mapGroup.add(prop);
          } else if (['chair', 'bed', 'locker', 'sofa', 'table', 'plant', 'monitor', 'tech_scrap', 'pressure_plate', 'weapon_rack', 'ammo_crate', 'medical_bed', 'autodoc', 'turret', 'generator', 'bio_scanner', 'cctv'].includes(cell.type)) {
            const prop = this.buildGenericProp(cell.type, x, 0, z);
            this.mapGroup.add(prop);
          }
        }

        // Inventory Cache
"""

code = furniture_block_regex.sub(replacement_block, code)

# Clean up any leftover 'if (cell && cell.type === 'storage_box')' that might have been skipped
storage_regex = re.compile(r"if \(cell && cell\.type === 'storage_box'\) \{.*?this\.mapGroup\.add\(crate\);\s*\}", re.DOTALL)
code = storage_regex.sub("", code)

with open('/home/matthias/project/zero_sum_rpg/web-app/src/app/threejs-map.component.ts', 'w') as f:
    f.write(code)

print("Updated threejs-map.component.ts successfully.")
