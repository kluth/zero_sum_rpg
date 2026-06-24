import { Result, ok, err } from 'neverthrow';
import { Coordinate } from '../optics/Coordinate';
import { Material } from './Material';

export class InvalidVoxelError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidVoxelError';
  }
}

export class Voxel {
  private constructor(
    public readonly position: Coordinate,
    public readonly material: Material,
    public readonly structuralIntegrity: number
  ) {}

  public static create(
    position: Coordinate,
    material: Material,
    structuralIntegrity: number
  ): Result<Voxel, InvalidVoxelError> {
    if (structuralIntegrity < 0.0 || structuralIntegrity > 1.0) {
      return err(new InvalidVoxelError('Structural integrity must be between 0.0 and 1.0'));
    }
    return ok(new Voxel(position, material, structuralIntegrity));
  }
}
