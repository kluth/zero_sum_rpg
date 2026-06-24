import { Coordinate } from '../../src/optics/Coordinate';
import { Material, MaterialType } from '../../src/topology/Material';
import { Voxel } from '../../src/topology/Voxel';

describe('Voxel Value Object', () => {
  it('should create a valid voxel', () => {
    const coord = Coordinate.create(0, 0, 0)._unsafeUnwrap();
    const material = Material.create(MaterialType.STEEL)._unsafeUnwrap();
    
    const result = Voxel.create(coord, material, 1.0);
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.material.type).toBe(MaterialType.STEEL);
      expect(result.value.structuralIntegrity).toBe(1.0);
    }
  });

  it('should fail on invalid structural integrity', () => {
    const coord = Coordinate.create(0, 0, 0)._unsafeUnwrap();
    const material = Material.create(MaterialType.STEEL)._unsafeUnwrap();
    
    const result = Voxel.create(coord, material, -0.5);
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.message).toBe('Structural integrity must be between 0.0 and 1.0');
    }
  });
});
