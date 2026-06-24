import { TopologyRepositoryPort, BoundingBox } from '../out/TopologyRepositoryPort';
import { Voxel } from '../../Voxel';
import { Result, ok, err } from 'neverthrow';

export class InvalidBoundsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidBoundsError';
  }
}

export class GetTopologyQueryHandler {
  constructor(private readonly repository: TopologyRepositoryPort) {}

  public execute(bounds: BoundingBox): Result<Voxel[], InvalidBoundsError | Error> {
    if (bounds.min.x > bounds.max.x || bounds.min.y > bounds.max.y || bounds.min.z > bounds.max.z) {
      return err(new InvalidBoundsError('Min coordinates cannot be greater than max coordinates'));
    }

    return this.repository.getVoxelsInBounds(bounds);
  }
}
