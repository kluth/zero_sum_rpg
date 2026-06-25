import { Injectable, inject } from '@angular/core';
import { GridStore } from '../../grid.store';

@Injectable({
  providedIn: 'root'
})
export class FacilityGeneratorService {
  private gridStore = inject(GridStore);

  generateProceduralFacility(currentLevel: number): string {
    this.gridStore.setState({ dimensions: { width: 50, height: 30 } });
    
    const newRooms: Record<string, any> = {};
    const roomCenters: {x: number, y: number}[] = [];
    
    this.generateSectors(currentLevel, newRooms, roomCenters);
    this.connectSectors(currentLevel, roomCenters);
    this.addOutdoorEnvironment(currentLevel);
    
    Object.keys(newRooms).forEach(k => this.gridStore.updateRoom(k, newRooms[k]));
    
    return "FACILITY GENERATED SUCCESSFULLY. ALL ROOMS CONNECTED.";
  }

  private generateSectors(currentLevel: number, newRooms: Record<string, any>, roomCenters: {x: number, y: number}[]): void {
    for (let i = 0; i < 6; i++) {
        const roomId = `room_${Math.random().toString(36).substr(2, 6)}`;
        const w = Math.floor(Math.random() * 6) + 5;
        const h = Math.floor(Math.random() * 6) + 5;
        const x = Math.floor(Math.random() * (48 - w)) + 1;
        const y = Math.floor(Math.random() * (28 - h)) + 1;
        
        newRooms[roomId] = {
            tag: `Sector ${i+1}`,
            bounds: { x, y, z: currentLevel, w, h },
            color: i === 0 ? '#FF003C' : '#39FF14',
            metadata: { threat: i === 0 ? 'critical' : 'medium', vfx: i === 0 ? 'flash_red_alert' : 'none' }
        };
        
        this.fillRoomFloor(x, y, w, h, roomId, currentLevel);
        this.buildRoomWalls(x, y, w, h, roomId, currentLevel);
        
        roomCenters.push({ x: Math.floor(x + w/2), y: Math.floor(y + h/2) });
    }
  }

  private fillRoomFloor(x: number, y: number, w: number, h: number, roomId: string, currentLevel: number): void {
    for (let r_x = x + 1; r_x < x + w - 1; r_x++) {
        for (let r_y = y + 1; r_y < y + h - 1; r_y++) {
           this.gridStore.updateCell(r_x, r_y, currentLevel, { type: 'floor', roomId: roomId });
        }
    }
  }

  private buildRoomWalls(x: number, y: number, w: number, h: number, roomId: string, currentLevel: number): void {
    for (let r_x = x; r_x < x + w; r_x++) {
        for (let r_y = y; r_y < y + h; r_y++) {
           if (r_x === x || r_x === x + w - 1 || r_y === y || r_y === y + h - 1) {
               this.gridStore.updateCell(r_x, r_y, currentLevel, { type: 'structure_wall', roomId: roomId });
           }
        }
    }
  }

  private connectSectors(currentLevel: number, roomCenters: {x: number, y: number}[]): void {
    for (let i = 1; i < roomCenters.length; i++) {
        const c1 = roomCenters[i-1];
        const c2 = roomCenters[i];
        
        let cx = c1.x;
        let cy = c1.y;
        cx = this.carveXCorridor(cx, cy, c2.x, currentLevel);
        this.carveYCorridor(cx, cy, c2.y, currentLevel);
    }
  }

  private carveXCorridor(cx: number, cy: number, targetX: number, currentLevel: number): number {
    while (cx !== targetX) {
        cx += cx < targetX ? 1 : -1;
        const cell = this.gridStore.grid()[`${cx},${cy},${currentLevel}`];
        if (cell && cell.type === 'structure_wall') {
            this.gridStore.updateCell(cx, cy, currentLevel, { type: Math.random() > 0.5 ? 'door_locked' : 'breakable_wall' });
        } else if (!cell || cell.type === 'empty') {
            this.gridStore.updateCell(cx, cy, currentLevel, { type: 'floor' });
            if (!this.gridStore.grid()[`${cx},${cy-1},${currentLevel}`]) this.gridStore.updateCell(cx, cy-1, currentLevel, { type: 'structure_wall' });
            if (!this.gridStore.grid()[`${cx},${cy+1},${currentLevel}`]) this.gridStore.updateCell(cx, cy+1, currentLevel, { type: 'structure_wall' });
        }
    }
    return cx;
  }

  private carveYCorridor(cx: number, cy: number, targetY: number, currentLevel: number): void {
    while (cy !== targetY) {
        cy += cy < targetY ? 1 : -1;
        const cell = this.gridStore.grid()[`${cx},${cy},${currentLevel}`];
        if (cell && cell.type === 'structure_wall') {
            this.gridStore.updateCell(cx, cy, currentLevel, { type: Math.random() > 0.5 ? 'door_locked' : 'door_open' });
        } else if (!cell || cell.type === 'empty') {
            this.gridStore.updateCell(cx, cy, currentLevel, { type: 'floor' });
            if (!this.gridStore.grid()[`${cx-1},${cy},${currentLevel}`]) this.gridStore.updateCell(cx-1, cy, currentLevel, { type: 'structure_wall' });
            if (!this.gridStore.grid()[`${cx+1},${cy},${currentLevel}`]) this.gridStore.updateCell(cx+1, cy, currentLevel, { type: 'structure_wall' });
        }
    }
  }

  private addOutdoorEnvironment(currentLevel: number): void {
    for (let x = 0; x < 50; x++) {
        for (let y = 0; y < 30; y++) {
            if (!this.gridStore.grid()[`${x},${y},${currentLevel}`]) {
                if (Math.random() > 0.95) this.gridStore.updateCell(x, y, currentLevel, { type: 'grass' });
                else if (Math.random() > 0.98) this.gridStore.updateCell(x, y, currentLevel, { type: 'street' });
            }
        }
    }
  }

  applyRoomTemplate(roomId: string, templateName: string, currentLevel: number): void {
    const room = this.gridStore.rooms()[roomId];
    if (!room || !room.bounds) return;

    const { x, y, w, h } = room.bounds;
    this.clearInterior(x, y, w, h, roomId, currentLevel);

    if (templateName === 'office') {
       this.applyOfficeTemplate(roomId, x, y, w, h, currentLevel);
    } else if (templateName === 'storage') {
       this.applyStorageTemplate(roomId, x, y, w, h, currentLevel);
    } else if (templateName === 'server_room') {
       this.applyServerRoomTemplate(roomId, x, y, w, h, currentLevel);
    } else if (templateName === 'medbay') {
       this.applyMedbayTemplate(roomId, x, y, w, h, currentLevel);
    }

    this.ensureRoomHasDoor(roomId, x, y, w, h, currentLevel);
  }

  private clearInterior(x: number, y: number, w: number, h: number, roomId: string, currentLevel: number): void {
    for (let r_x = x + 1; r_x < x + w - 1; r_x++) {
        for (let r_y = y + 1; r_y < y + h - 1; r_y++) {
            this.gridStore.updateCell(r_x, r_y, currentLevel, { type: 'floor', roomId: roomId } as any);
        }
    }
  }

  private applyOfficeTemplate(roomId: string, x: number, y: number, w: number, h: number, currentLevel: number): void {
    this.updateRoomData(roomId, { tag: "Corporate Office" });
    this.gridStore.updateCell(x + 1, y + 1, currentLevel, { type: 'cupboard', roomId: roomId } as any);
    this.gridStore.updateCell(x + w - 2, y + h - 2, currentLevel, { type: 'cupboard', roomId: roomId } as any);
    this.gridStore.updateCell(x + Math.floor(w/2), y + Math.floor(h/2), currentLevel, { type: 'furniture', roomId: roomId } as any);
    this.gridStore.updateCell(x + Math.floor(w/2) + 1, y + Math.floor(h/2), currentLevel, { type: 'floor', roomId: roomId, inventory: [{ id: 'datapad', name: 'Secure Datapad' }] } as any);
  }

  private applyStorageTemplate(roomId: string, x: number, y: number, w: number, h: number, currentLevel: number): void {
    this.updateRoomData(roomId, { tag: "Storage Area" });
    for (let r_x = x + 1; r_x < x + w - 1; r_x++) {
        for (let r_y = y + 1; r_y < y + h - 1; r_y++) {
            const rand = Math.random();
            if (rand > 0.8) {
                this.gridStore.updateCell(r_x, r_y, currentLevel, { type: 'storage_box', roomId: roomId } as any);
            } else if (rand > 0.6) {
                this.gridStore.updateCell(r_x, r_y, currentLevel, { type: 'floor', roomId: roomId, inventory: [{ id: 'scrap', name: 'Tech Scrap' }] } as any);
            }
        }
    }
    this.gridStore.updateCell(x + Math.floor(w/2), y, currentLevel, { type: 'breakable_wall', roomId: roomId } as any);
  }

  private applyServerRoomTemplate(roomId: string, x: number, y: number, w: number, h: number, currentLevel: number): void {
    this.updateRoomData(roomId, { tag: "Server Mainframe" });
    const room = this.gridStore.rooms()[roomId];
    this.gridStore.updateRoom(roomId, { ...room, metadata: { ...room.metadata, vfx: 'flicker_blue_data', threat: 'medium' } });
    
    for (let r_x = x + 2; r_x < x + w - 2; r_x += 2) {
        for (let r_y = y + 1; r_y < y + h - 1; r_y++) {
            if (r_y !== y + Math.floor(h/2)) {
                this.gridStore.updateCell(r_x, r_y, currentLevel, { type: 'server_rack', roomId: roomId } as any);
            }
        }
    }
  }

  private applyMedbayTemplate(roomId: string, x: number, y: number, w: number, h: number, currentLevel: number): void {
    this.updateRoomData(roomId, { tag: "Medical Bay" });
    const room = this.gridStore.rooms()[roomId];
    this.gridStore.updateRoom(roomId, { ...room, metadata: { ...room.metadata, vfx: 'flash_red_alert', threat: 'critical' } });
    
    for (let r_x = x + 1; r_x < x + w - 1; r_x += 2) {
        this.gridStore.updateCell(r_x, y + 1, currentLevel, { type: 'furniture', roomId: roomId } as any);
        this.gridStore.updateCell(r_x, y + 2, currentLevel, { type: 'floor', roomId: roomId, inventory: [{ id: 'medkit', name: 'Emergency Medkit' }] } as any);
    }
  }

  private ensureRoomHasDoor(roomId: string, x: number, y: number, w: number, h: number, currentLevel: number): void {
    let hasDoor = false;
    for (let r_x = x; r_x < x + w; r_x++) {
        for (let r_y = y; r_y < y + h; r_y++) {
           if (r_x === x || r_x === x + w - 1 || r_y === y || r_y === y + h - 1) {
              const cell = this.gridStore.grid()[`${r_x},${r_y},${currentLevel}`];
              if (cell && (cell.type === 'door_locked' || cell.type === 'door_open')) {
                 hasDoor = true;
              }
           }
        }
    }
    if (!hasDoor) {
       this.gridStore.updateCell(x + Math.floor(w/2), y, currentLevel, { type: 'door_locked', roomId: roomId } as any);
    }
  }

  private updateRoomData(roomId: string, data: any): void {
    const room = this.gridStore.rooms()[roomId];
    if (room) {
       this.gridStore.updateRoom(roomId, { ...room, ...data });
    }
  }
}
