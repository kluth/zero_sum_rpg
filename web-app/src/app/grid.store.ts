import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { CellType, GameStateDTO, CellDTO } from '../../../core-domain/src/ttrpg/GameStateDTO';
import { UIGameState, UIRoom, GridStateAdapter } from './core/adapters/GridStateAdapter';

export type TileType = CellType;
export type GridCell = CellDTO;
export type RoomData = UIRoom;
export type GameState = UIGameState;

export const GridStore = signalStore(
  { providedIn: 'root' },
  withState<GameState>({
    dimensions: { width: 50, height: 30 },
    grid: {},
    rooms: {},
    prefabs: {},
    globalHeat: 0
  }),
  withMethods((store) => ({
    setState(newState: Partial<GameState>) {
      patchState(store, newState);
    },
    ingestDomainState(dto: GameStateDTO) {
      const viewModel = GridStateAdapter.toViewModel(dto, store.prefabs());
      patchState(store, viewModel);
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
