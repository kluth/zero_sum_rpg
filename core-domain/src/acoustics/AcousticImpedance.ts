import { Result, ok, err } from 'neverthrow';

export class InvalidAcousticImpedanceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidAcousticImpedanceError';
  }
}

export class AcousticImpedance {
  private constructor(public readonly lossPerMeter: number) {}

  public static create(lossPerMeter: number): Result<AcousticImpedance, InvalidAcousticImpedanceError> {
    if (lossPerMeter < 0) {
      return err(new InvalidAcousticImpedanceError('AcousticImpedance cannot be negative'));
    }
    return ok(new AcousticImpedance(lossPerMeter));
  }
}
