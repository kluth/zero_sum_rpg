import { Result, ok, err } from 'neverthrow';

export class InvalidLuxLevelError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidLuxLevelError';
  }
}

export class LuxLevel {
  private constructor(public readonly lux: number) {}

  public static create(lux: number): Result<LuxLevel, InvalidLuxLevelError> {
    if (lux < 0) {
      return err(new InvalidLuxLevelError('LuxLevel cannot be negative'));
    }
    return ok(new LuxLevel(lux));
  }
}
