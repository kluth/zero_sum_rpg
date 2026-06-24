import { Result, ok } from 'neverthrow';

export class Coordinate {
  private constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly z: number
  ) {}

  public static create(x: number, y: number, z: number = 0): Result<Coordinate, never> {
    // Coordinates can be any integer, no failure conditions currently
    return ok(new Coordinate(Math.floor(x), Math.floor(y), Math.floor(z)));
  }

  public distanceTo(other: Coordinate): number {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    const dz = this.z - other.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
}
