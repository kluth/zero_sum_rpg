import { Result, ok, err } from 'neverthrow';

export enum MaterialType {
  UNKNOWN = 0,
  AIR = 1,
  CONCRETE = 2,
  GLASS = 3,
  STEEL = 4
}

export class InvalidMaterialError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidMaterialError';
  }
}

export class Material {
  private constructor(public readonly type: MaterialType) {}

  public static create(type: MaterialType): Result<Material, InvalidMaterialError> {
    if (type === MaterialType.UNKNOWN) {
      return err(new InvalidMaterialError('Material type cannot be unknown'));
    }
    return ok(new Material(type));
  }
}
