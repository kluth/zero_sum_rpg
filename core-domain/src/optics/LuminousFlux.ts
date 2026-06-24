import { Result, ok, err } from 'neverthrow';

export class InvalidLuminousFluxError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidLuminousFluxError';
  }
}

export class LuminousFlux {
  private constructor(public readonly lumen: number) {}

  public static create(lumen: number): Result<LuminousFlux, InvalidLuminousFluxError> {
    if (lumen < 0) {
      return err(new InvalidLuminousFluxError('LuminousFlux cannot be negative'));
    }
    return ok(new LuminousFlux(lumen));
  }
}
