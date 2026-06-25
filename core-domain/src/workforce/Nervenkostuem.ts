import { Result, success, failure } from '../shared/Result';

export class Nervenkostuem {
  private constructor(private readonly value: number) {}

  public static create(value: number): Result<Nervenkostuem, string> {
    if (value < 0 || value > 100) {
      return failure('Nervenkostuem value must be between 0 and 100.');
    }
    return success(new Nervenkostuem(value));
  }

  public getValue(): number {
    return this.value;
  }

  public increase(amount: number): Nervenkostuem {
    const newValue = Math.min(100, this.value + amount);
    return new Nervenkostuem(newValue);
  }

  public decrease(amount: number): Nervenkostuem {
    const newValue = Math.max(0, this.value - amount);
    return new Nervenkostuem(newValue);
  }
}
