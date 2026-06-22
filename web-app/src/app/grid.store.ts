import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';

export type TileType = 'empty' | 'wall' | 'floor' | 'door_open' | 'door_locked' | 'cctv' | 'furniture' | 'structure_wall' | 'breakable_wall' | 'cupboard' | 'storage_box' | 'server_rack' | 'street' | 'grass' | 'water';

export type GridCell = {
  type: TileType;
  room_id?: string;
  char_id?: string;
  dynamic_data?: any;
};

export type RoomData = {
  tag: string;
  bounds: { x: number, y: number, z?: number, w: number, h: number };
  metadata: { vfx?: string, threat?: string, revealedTo?: any, visibleTo?: any, zHeight?: number };
};

export type GameState = {
  dimensions: { width: number, height: number };
  grid: Record<string, GridCell>;
  rooms: Record<string, RoomData>;
  prefabs: Record<string, any>;
};

export const GridStore = signalStore(
  { providedIn: 'root' },
  withState<GameState>({
    dimensions: { width: 50, height: 30 },
    grid: {},
    rooms: {},
    prefabs: {}
  }),
  withMethods((store) => ({
    setState(newState: Partial<GameState>) {
      patchState(store, newState);
    },
    updateCell(x: number, y: number, z: number, cellData: GridCell) {
      const key = `${x},${y},${z}`;
      patchState(store, (state) => ({
        grid: { ...state.grid, [key]: cellData }
      }));
    },
    updateRoom(roomId: string, roomData: RoomData) {
      patchState(store, (state) => ({
        rooms: { ...state.rooms, [roomId]: roomData }
      }));
    }
  }))
);
