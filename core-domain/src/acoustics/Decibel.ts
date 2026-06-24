import { Result, ok } from 'neverthrow';

export class Decibel {
  private constructor(public readonly db: number) {}

  public static create(db: number): Result<Decibel, Error> {
    return ok(new Decibel(db));
  }

  public add(other: Decibel): Decibel {
    return new Decibel(this.db + other.db);
  }

  public subtract(other: Decibel): Decibel {
    return new Decibel(this.db - other.db);
  }
}
