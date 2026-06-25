import { Injectable } from '@angular/core';
import * as PIXI from 'pixi.js';

@Injectable({ providedIn: 'root' })
export class PixiRendererService {
  
  hasLineOfSight(x0: number, y0: number, x1: number, y1: number, currentLevel: number, grid: any): boolean {
    let dx = Math.abs(x1 - x0);
    let dy = Math.abs(y1 - y0);
    let sx = (x0 < x1) ? 1 : -1;
    let sy = (y0 < y1) ? 1 : -1;
    let err = dx - dy;

    while (true) {
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) { err -= dy; x0 += sx; }
      if (e2 < dx) { err += dx; y0 += sy; }

      if (x0 === x1 && y0 === y1) break;
      const cell = grid[`${x0},${y0},${currentLevel}`] || grid[`${x0},${y0}`];
      if (cell && (cell.type === 'wall' || cell.type === 'door_locked' || cell.type === 'structure_wall')) {
        return false;
      }
    }
    return true;
  }

  private drawBasicCell(g: PIXI.Graphics, type: string) {
    if (!type || type === 'empty' || type === 'floor') {
      g.rect(0, 0, 32, 32);
      g.fill({ color: 0x111111 });
      g.stroke({ color: 0x222222, width: 1 });
    } else if (type === 'wall') {
      g.rect(0, 0, 32, 32);
      g.fill({ color: 0x00E5FF });
    } else if (type === 'structure_wall') {
      g.rect(0, 0, 32, 32);
      g.fill({ color: 0x555555 });
    } else if (type === 'door_locked') {
      g.rect(0, 0, 32, 32);
      g.fill({ color: 0xFF003C });
    } else if (type === 'door_open') {
      g.rect(0, 0, 32, 32);
      g.fill({ color: 0x111111 });
      g.stroke({ color: 0x00FF66, width: 2 });
    }
  }

  private drawInteractiveCell(g: PIXI.Graphics, type: string) {
    if (type === 'cctv') {
      g.rect(0, 0, 32, 32);
      g.fill({ color: 0x111111 });
      g.stroke({ color: 0x222222, width: 1 });
      g.circle(16, 16, 8);
      g.fill({ color: 0xFFFF00 });
    } else if (type === 'breakable_wall') {
      g.rect(0, 0, 32, 32);
      g.fill({ color: 0x111111 });
      g.stroke({ color: 0xaa5522, width: 2 });
      g.moveTo(4, 4); g.lineTo(28, 28);
      g.stroke({ color: 0xaa5522, width: 1 });
    } else if (type === 'cupboard') {
      g.rect(0, 0, 32, 32);
      g.fill({ color: 0x444444 });
      g.stroke({ color: 0x222222, width: 1 });
    } else if (type === 'storage_box') {
      g.rect(0, 0, 32, 32);
      g.fill({ color: 0x111111 });
      g.stroke({ color: 0x666666, width: 2 });
      g.rect(8, 8, 16, 16);
      g.fill({ color: 0x666666 });
    } else if (type === 'server_rack') {
      g.rect(2, 2, 28, 28);
      g.fill({ color: 0x111111 });
      g.stroke({ color: 0x00aaff, width: 2 });
    }
  }

  private drawFurnitureOrNature(g: PIXI.Graphics, cellContainer: PIXI.Container, type: string, x: number) {
    if (['chair', 'bed', 'locker', 'sofa', 'plant', 'table', 'monitor'].includes(type)) {
      g.rect(4, 4, 24, 24);
      g.fill({ color: 0x888888 });
      g.stroke({ color: 0x555555, width: 1 });
      const text = new PIXI.Text({ text: type.substring(0,2).toUpperCase(), style: { fontSize: 10, fill: 0xffffff } });
      text.x = 16 - text.width / 2;
      text.y = 16 - text.height / 2;
      cellContainer.addChild(text);
    } else if (type === 'grass') {
      g.rect(0, 0, 32, 32);
      g.fill({ color: 0x051105 });
      g.stroke({ color: 0x113311, width: 1 });
      g.moveTo(8, 24); g.lineTo(10, 16);
      g.stroke({ color: 0x00FF00, width: 1 });
    } else if (type === 'street') {
      g.rect(0, 0, 32, 32);
      g.fill({ color: 0x1a1a1a });
      g.stroke({ color: 0x2a2a2a, width: 1 });
      if (x % 2 === 0) {
          g.rect(14, 10, 4, 12);
          g.fill({ color: 0xDDDD00 });
      }
    } else if (type === 'water') {
      g.rect(0, 0, 32, 32);
      g.fill({ color: 0x001133 });
      g.stroke({ color: 0x002255, width: 1 });
      g.moveTo(8, 16); g.lineTo(24, 16);
      g.stroke({ color: 0x0088FF, width: 1 });
    }
  }

  private drawCellGraphics(g: PIXI.Graphics, cellContainer: PIXI.Container, cell: any, x: number) {
    const type = cell?.type || 'empty';
    if (['empty', 'floor', 'wall', 'structure_wall', 'door_locked', 'door_open'].includes(type)) {
       this.drawBasicCell(g, type);
    } else if (['cctv', 'breakable_wall', 'cupboard', 'storage_box', 'server_rack'].includes(type)) {
       this.drawInteractiveCell(g, type);
    } else {
       this.drawFurnitureOrNature(g, cellContainer, type, x);
    }

    if (cell && cell.inventory && Array.isArray(cell.inventory) && cell.inventory.length > 0) {
      g.rect(20, 20, 8, 8);
      g.fill({ color: 0xFFFF00 });
      g.stroke({ color: 0xFF8800, width: 1 });
    }
  }

  renderStaticMap(staticLayer: PIXI.Container, dim: any, grid: any, rooms: any, currentLevel: number, cachedCells: Record<string, PIXI.Container>) {
    if (!dim || !staticLayer) return;

    Object.values(cachedCells).forEach(c => {
        staticLayer.removeChild(c);
        c.destroy({children: true});
    });
    for (const key in cachedCells) delete cachedCells[key];

    for (let x = 0; x < dim.width; x++) {
      for (let y = 0; y < dim.height; y++) {
         const key = `${x},${y},${currentLevel}`;
         const fallbackKey = `${x},${y}`;
         const cell = grid[key] || grid[fallbackKey];

         const cellContainer = new PIXI.Container();
         cellContainer.x = x * 32;
         cellContainer.y = y * 32;
         
         (cellContainer as any).cellX = x;
         (cellContainer as any).cellY = y;
         (cellContainer as any).cellType = cell?.type || 'empty';
         (cellContainer as any).roomId = cell?.roomId || null;

         cachedCells[`${x},${y}`] = cellContainer;
         staticLayer.addChild(cellContainer);

         const g = new PIXI.Graphics();
         cellContainer.addChild(g);
         this.drawCellGraphics(g, cellContainer, cell, x);
      }
    }
  }

  private updateFogOfWar(cachedCells: Record<string, PIXI.Container>, mode: string, fovSet: Set<string>, rooms: any, activePlayerId: string | null) {
    for (const key in cachedCells) {
        const cellContainer = cachedCells[key];
        const type = (cellContainer as any).cellType;
        const roomId = (cellContainer as any).roomId;

        let isVisible = true;
        let isRevealed = false;

        if (mode === 'player' && activePlayerId) {
            if (fovSet.has(key)) {
                isVisible = true;
            } else {
                isVisible = false;
                const parentRoom = roomId ? rooms[roomId] : null;
                isRevealed = parentRoom?.metadata?.revealedTo && parentRoom.metadata.revealedTo[activePlayerId];
            }
        } else if (mode === 'spectator' && roomId) {
            const parentRoom = rooms[roomId];
            isRevealed = parentRoom?.metadata?.revealedTo && Object.values(parentRoom.metadata.revealedTo).some(v => v === true);
            isVisible = isRevealed;
        }

        if (isVisible) {
            cellContainer.visible = true;
            cellContainer.alpha = 1;
        } else if (isRevealed && type === 'structure_wall') {
            cellContainer.visible = true;
            cellContainer.alpha = 1;
        } else {
            cellContainer.visible = false;
        }
    }
  }

  private updateRooms(roomLayer: PIXI.Container, rooms: any, mode: string, activePlayerId: string | null, fovSet: Set<string>, playerFov: any[], roomGraphics: Record<string, PIXI.Graphics>) {
    const activeRooms = new Set<string>();
    for (const [roomId, room] of Object.entries(rooms) as [string, any][]) {
      if (!room || !room.bounds) continue;
      let isVisible = true;
      let isMemory = false;

      if (mode === 'spectator') {
         const isRevealed = room.metadata?.revealedTo && Object.values(room.metadata.revealedTo).some(v => v === true);
         if (!isRevealed) isVisible = false;
      } else if (mode === 'player' && activePlayerId) {
         const cx = Math.floor(room.bounds.x + room.bounds.w/2);
         const cy = Math.floor(room.bounds.y + room.bounds.h/2);
         const hasLos = fovSet.has(`${cx},${cy}`) || playerFov.some((c: any) => c.x >= room.bounds.x && c.x <= room.bounds.x + room.bounds.w && c.y >= room.bounds.y && c.y <= room.bounds.y + room.bounds.h);
         
         if (hasLos) {
            isVisible = true;
            isMemory = false;
         } else {
            const isRevealedToMe = room.metadata?.revealedTo && room.metadata.revealedTo[activePlayerId];
            if (isRevealedToMe) {
               isMemory = true;
               isVisible = true;
            } else {
               isVisible = false;
            }
         }
      }

      if (!isVisible) continue;
      activeRooms.add(roomId);

      let g = roomGraphics[roomId];
      if (!g) {
          g = new PIXI.Graphics();
          roomLayer.addChild(g);
          roomGraphics[roomId] = g;
      } else {
          g.clear();
          g.removeChildren();
      }

      const bounds = room.bounds;
      const isCritical = room.metadata?.threat === 'critical';
      const color = isMemory ? 0x555555 : (isCritical ? 0xff0000 : 0x00E5FF);
      const alpha = isMemory ? 0.2 : (isCritical ? 0.3 : 0.1);

      g.rect(bounds.x * 32, bounds.y * 32, bounds.w * 32, bounds.h * 32);
      g.fill({ color, alpha });
      g.stroke({ color, width: 2, alpha: isMemory ? 0.3 : 1 });
      
      if (!isMemory) {
          const text = new PIXI.Text({ text: room.tag || roomId, style: { fontSize: 14, fill: color, fontFamily: 'monospace' }});
          text.x = bounds.x * 32 + 5;
          text.y = bounds.y * 32 + 5;
          g.addChild(text);
      }
    }

    Object.keys(roomGraphics).forEach(key => {
        if (!activeRooms.has(key)) {
            const g = roomGraphics[key];
            roomLayer.removeChild(g);
            g.destroy({children: true});
            delete roomGraphics[key];
        }
    });
  }

  private updateCharacters(dynamicLayer: PIXI.Container, characters: Record<string, any>, mode: string, activePlayerId: string | null, fovSet: Set<string>, charGraphics: Record<string, PIXI.Graphics | PIXI.Text>) {
    const activeChars = new Set<string>();
    if (characters) {
       for (const [charId, char] of Object.entries(characters) as [string, any][]) {
          let isVisible = true;
          if (mode === 'player' && activePlayerId) {
              isVisible = fovSet.has(`${char.x},${char.y}`);
          } else if (mode === 'spectator') {
              isVisible = true;
          }

          if (!isVisible && charId !== activePlayerId) continue;
          activeChars.add(charId);
          activeChars.add(charId + '_label');

          let cg = charGraphics[charId] as PIXI.Graphics;
          if (!cg) {
              cg = new PIXI.Graphics();
              dynamicLayer.addChild(cg);
              charGraphics[charId] = cg;
          } else {
              cg.clear();
          }

          const isPlayer = charId.startsWith('p');
          const cx = char.x * 32 + 16;
          const cy = char.y * 32 + 16;
          
          if (isPlayer) {
              const color = charId === activePlayerId ? 0x00FF00 : 0x00AAFF;
              cg.circle(cx, cy, 12);
              cg.fill({ color });
              cg.stroke({ color: 0xFFFFFF, width: charId === activePlayerId ? 2 : 1 });
              
              const rot = char.rotation || 0;
              cg.moveTo(cx, cy);
              cg.arc(cx, cy, 64, rot - 0.6, rot + 0.6);
              cg.lineTo(cx, cy);
              cg.fill({ color: 0xFFFFFF, alpha: 0.2 });
          } else {
              cg.moveTo(cx, cy - 14);
              cg.lineTo(cx + 14, cy);
              cg.lineTo(cx, cy + 14);
              cg.lineTo(cx - 14, cy);
              cg.fill({ color: 0xFF2A2A });
              cg.stroke({ color: 0xFF0000, width: 2 });
          }

          const labelId = charId + '_label';
          let label = charGraphics[labelId] as PIXI.Text;
          if (!label) {
              label = new PIXI.Text({ text: char.name, style: { fontSize: 10, fill: 0xFFFFFF } });
              dynamicLayer.addChild(label);
              charGraphics[labelId] = label;
          } else {
              label.text = char.name;
          }
          label.x = char.x * 32;
          label.y = char.y * 32 - 15;
       }
    }

    Object.keys(charGraphics).forEach(key => {
        if (!activeChars.has(key)) {
            const g = charGraphics[key];
            dynamicLayer.removeChild(g);
            g.destroy({children: true});
            delete charGraphics[key];
        }
    });
  }

  private updateAcoustics(dynamicLayer: PIXI.Container, sensoryData: any, acousticsSprites: Record<string, PIXI.Graphics>) {
    const activeAcoustics = new Set<string>();
    if (sensoryData?.acoustics && Array.isArray(sensoryData.acoustics)) {
        for (let i = 0; i < sensoryData.acoustics.length; i++) {
             const sound = sensoryData.acoustics[i];
             const key = `acoustics_${i}`;
             activeAcoustics.add(key);

             let sndGr = acousticsSprites[key];
             if (!sndGr) {
                 sndGr = new PIXI.Graphics();
                 dynamicLayer.addChild(sndGr);
                 acousticsSprites[key] = sndGr;
             } else {
                 sndGr.clear();
             }
             
             sndGr.circle(sound.x * 32 + 16, sound.y * 32 + 16, sound.radius * 32);
             sndGr.stroke({ color: sound.type === 'GUNFIRE' ? 0xFF0000 : 0x00FFFF, width: 2, alpha: 0.5 });
             
             if (sound.cells && Array.isArray(sound.cells)) {
                 for (const cell of sound.cells) {
                     sndGr.rect(cell.x * 32, cell.y * 32, 32, 32);
                     sndGr.fill({ color: sound.type === 'GUNFIRE' ? 0xAA0000 : 0x00AAAA, alpha: 0.2 });
                 }
             }
        }
    }

    Object.keys(acousticsSprites).forEach(key => {
        if (!activeAcoustics.has(key)) {
            const s = acousticsSprites[key];
            dynamicLayer.removeChild(s);
            s.destroy({children: true});
            delete acousticsSprites[key];
        }
    });
  }

  renderDynamicEntities(
    dynamicLayer: PIXI.Container,
    roomLayer: PIXI.Container,
    dim: any,
    grid: any,
    rooms: any,
    mode: string,
    activePlayerId: string | null,
    characters: Record<string, any>,
    sensoryData: any,
    currentLevel: number,
    cachedCells: Record<string, PIXI.Container>,
    roomGraphics: Record<string, PIXI.Graphics>,
    charGraphics: Record<string, PIXI.Graphics | PIXI.Text>,
    acousticsSprites: Record<string, PIXI.Graphics>
  ) {
    if (!dim) return;

    let myChar: any = null;
    if (mode === 'player' && activePlayerId && characters) {
       myChar = characters[activePlayerId];
    }
    const playerFov = (myChar && sensoryData?.fov?.[myChar.id]) ? sensoryData.fov[myChar.id] : [];
    
    const fovSet = new Set<string>();
    if (mode === 'player' && myChar) {
       for (const c of playerFov) fovSet.add(`${c.x},${c.y}`);
    }

    this.updateFogOfWar(cachedCells, mode, fovSet, rooms, activePlayerId);
    this.updateRooms(roomLayer, rooms, mode, activePlayerId, fovSet, playerFov, roomGraphics);
    this.updateCharacters(dynamicLayer, characters, mode, activePlayerId, fovSet, charGraphics);
    this.updateAcoustics(dynamicLayer, sensoryData, acousticsSprites);
  }
}
