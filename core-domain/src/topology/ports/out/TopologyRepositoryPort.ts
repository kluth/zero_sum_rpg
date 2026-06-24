import { Voxel } from '../../Voxel';
import { Coordinate } from '../../../optics/Coordinate';
import { Result } from 'neverthrow';

export interface BoundingBox {
  min: Coordinate;
  max: Coordinate;
}

export interface TopologyRepositoryPort {
  getVoxelsInBounds(bounds: BoundingBox): Result<Voxel[], Error>;
}
