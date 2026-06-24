import { Result, ok } from 'neverthrow';

export class Velocity {
  private constructor(
    public readonly dx: number,
    public readonly dy: number,
    public readonly dz: number
  ) {}

  public static create(dx: number, dy: number, dz: number): Result<Velocity, never> {
    return ok(new Velocity(dx, dy, dz));
  }

  public magnitude(): number {
    return Math.sqrt(this.dx * this.dx + this.dy * this.dy + this.dz * this.dz);
  }
}
