import { GameStateDTO, RoomDTO, CellDTO, ThreatLevel } from '../../../../../core-domain/src/ttrpg/GameStateDTO';

export interface UIRoom {
  tag: string;
  bounds: { x: number, y: number, z?: number, w: number, h: number };
  metadata: { vfx?: string, threat?: string, revealedTo?: any, visibleTo?: any, zHeight?: number };
}

export interface UIGameState {
  dimensions: { width: number, height: number };
  grid: Record<string, CellDTO>;
  rooms: Record<string, UIRoom>;
  prefabs: Record<string, any>;
  globalHeat: number;
}

export class GridStateAdapter {
  /**
   * Adapts the pure Domain DTO into a UI-friendly ViewModel.
   * Isolates the UI from domain structure changes.
   */
  public static toViewModel(dto: GameStateDTO, prefabs: Record<string, any>): UIGameState {
    const uiRooms: Record<string, UIRoom> = {};
    
    for (const [id, room] of Object.entries(dto.rooms)) {
      uiRooms[id] = this.adaptRoom(room);
    }

    return {
      dimensions: dto.mapDimensions,
      grid: dto.cells,
      rooms: uiRooms,
      prefabs: prefabs,
      globalHeat: dto.globalHeat
    };
  }

  private static adaptRoom(room: RoomDTO): UIRoom {
    let vfx = '';
    // Translate domain ThreatLevel to UI VFX rules
    if (room.threatLevel === ThreatLevel.CRITICAL) {
      vfx = 'flash_red_alert';
    } else if (room.threatLevel === ThreatLevel.ELEVATED) {
      vfx = 'pulse_orange';
    }

    return {
      tag: room.tag,
      bounds: room.bounds,
      metadata: {
        threat: room.threatLevel,
        vfx: vfx,
        revealedTo: room.revealedToPlayerIds,
        zHeight: room.bounds.z || 0
      }
    };
  }
}
