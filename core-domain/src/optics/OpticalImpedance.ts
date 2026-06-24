import { Result, ok, err } from 'neverthrow';

export class InvalidOpticalImpedanceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidOpticalImpedanceError';
  }
}

export class OpticalImpedance {
  private constructor(public readonly value: number) {}

  public static create(value: number): Result<OpticalImpedance, InvalidOpticalImpedanceError> {
    if (value < 0.0 || value > 1.0) {
      return err(new InvalidOpticalImpedanceError('OpticalImpedance must be between 0.0 and 1.0'));
    }
    return ok(new OpticalImpedance(value));
  }
}
