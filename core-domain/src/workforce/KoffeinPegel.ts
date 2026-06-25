import { Result, success, failure } from '../shared/Result';

export class KoffeinPegel {
  private constructor(private readonly value: number) {}

  public static create(value: number): Result<KoffeinPegel, string> {
    if (value < 0 || value > 100) {
      return failure('KoffeinPegel value must be between 0 and 100.');
    }
    return success(new KoffeinPegel(value));
  }

  public getValue(): number {
    return this.value;
  }

  public hasEnough(amount: number): boolean {
    return this.value >= amount;
  }

  public consume(amount: number): Result<KoffeinPegel, string> {
    if (!this.hasEnough(amount)) {
      return failure('Not enough KoffeinPegel.');
    }
    return success(new KoffeinPegel(this.value - amount));
  }

  public restore(amount: number): KoffeinPegel {
    const newValue = Math.min(100, this.value + amount);
    return new KoffeinPegel(newValue);
  }
}
