import { Result, ok, err } from 'neverthrow';

export class InvalidMassError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidMassError';
  }
}

export class Mass {
  private constructor(public readonly kg: number) {}

  public static create(kg: number): Result<Mass, InvalidMassError> {
    if (kg < 0) {
      return err(new InvalidMassError('Mass cannot be negative'));
    }
    return ok(new Mass(kg));
  }
}
