import { GetTopologyQueryHandler } from '../../src/topology/ports/in/GetTopologyQueryHandler';
import { TopologyRepositoryPort, BoundingBox } from '../../src/topology/ports/out/TopologyRepositoryPort';
import { Voxel } from '../../src/topology/Voxel';
import { Material, MaterialType } from '../../src/topology/Material';
import { Coordinate } from '../../src/optics/Coordinate';
import { Result, ok } from 'neverthrow';

class MockTopologyRepo implements TopologyRepositoryPort {
  getVoxelsInBounds(bounds: BoundingBox): Result<Voxel[], Error> {
    const coord = Coordinate.create(0, 0, 0)._unsafeUnwrap();
    const material = Material.create(MaterialType.CONCRETE)._unsafeUnwrap();
    const voxel = Voxel.create(coord, material, 1.0)._unsafeUnwrap();
    return ok([voxel]);
  }
}

describe('GetTopologyQueryHandler', () => {
  it('should return voxels within valid bounds', () => {
    const repo = new MockTopologyRepo();
    const handler = new GetTopologyQueryHandler(repo);

    const min = Coordinate.create(0, 0, 0)._unsafeUnwrap();
    const max = Coordinate.create(10, 10, 10)._unsafeUnwrap();

    const result = handler.execute({ min, max });
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.length).toBe(1);
    }
  });

  it('should return error if min > max', () => {
    const repo = new MockTopologyRepo();
    const handler = new GetTopologyQueryHandler(repo);

    const min = Coordinate.create(10, 10, 10)._unsafeUnwrap();
    const max = Coordinate.create(0, 0, 0)._unsafeUnwrap();

    const result = handler.execute({ min, max });
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.message).toBe('Min coordinates cannot be greater than max coordinates');
    }
  });
});
