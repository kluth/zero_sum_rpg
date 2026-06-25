import { Result, success, failure } from '../shared/Result';

export class BurnoutMeter {
  private constructor(private readonly value: number) {}

  public static create(value: number): Result<BurnoutMeter, string> {
    if (value < 0 || value > 100) {
      return failure('BurnoutMeter value must be between 0 and 100.');
    }
    return success(new BurnoutMeter(value));
  }

  public getValue(): number {
    return this.value;
  }

  public isCritical(): boolean {
    return this.value >= 80;
  }

  public isBurnout(): boolean {
    return this.value === 100;
  }

  public increase(amount: number): BurnoutMeter {
    const newValue = Math.min(100, this.value + amount);
    return new BurnoutMeter(newValue);
  }

  public decrease(amount: number): BurnoutMeter {
    const newValue = Math.max(0, this.value - amount);
    return new BurnoutMeter(newValue);
  }
}
