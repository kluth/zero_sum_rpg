import { Nervenkostuem } from './Nervenkostuem';
import { BurnoutMeter } from './BurnoutMeter';
import { KoffeinPegel } from './KoffeinPegel';
import { DomainEvent } from '../events/DomainEvent';
import { Result, success, failure } from '../shared/Result';
import { BurnoutWarningThresholdReachedEvent } from '../events/BurnoutWarningThresholdReachedEvent';

export abstract class WorkforceBase {
  private domainEvents: DomainEvent[] = [];

  constructor(
    public readonly id: string,
    public readonly name: string,
    protected nervenkostuem: Nervenkostuem,
    protected burnoutMeter: BurnoutMeter,
    protected koffeinPegel: KoffeinPegel
  ) {}

  public getDomainEvents(): DomainEvent[] {
    return [...this.domainEvents];
  }

  public clearDomainEvents(): void {
    this.domainEvents = [];
  }

  protected addDomainEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  public getNervenkostuem(): Nervenkostuem {
    return this.nervenkostuem;
  }

  public getBurnoutMeter(): BurnoutMeter {
    return this.burnoutMeter;
  }

  public getKoffeinPegel(): KoffeinPegel {
    return this.koffeinPegel;
  }

  // Base actions
  public takeDamage(amount: number): Result<void, string> {
    this.nervenkostuem = this.nervenkostuem.decrease(amount);
    return success(undefined);
  }

  public heal(amount: number): Result<void, string> {
    this.nervenkostuem = this.nervenkostuem.increase(amount);
    return success(undefined);
  }

  public applyStress(amount: number): Result<void, string> {
    this.burnoutMeter = this.burnoutMeter.increase(amount);
    
    // Check if threshold reached
    if (this.burnoutMeter.isCritical()) {
      this.addDomainEvent(
        new BurnoutWarningThresholdReachedEvent(
          this.id,
          this.burnoutMeter.getValue(),
          80
        )
      );
    }

    if (this.burnoutMeter.isBurnout()) {
      return failure(`Character ${this.name} suffered a burnout.`);
    }

    return success(undefined);
  }

  public relieveStress(amount: number): Result<void, string> {
    this.burnoutMeter = this.burnoutMeter.decrease(amount);
    return success(undefined);
  }

  public executeSop(cost: number): Result<void, string> {
    const consumeResult = this.koffeinPegel.consume(cost);
    if (consumeResult.isFailure()) {
      return failure(`Not enough focus to execute SOP. Cost: ${cost}`);
    }
    this.koffeinPegel = consumeResult.value as KoffeinPegel;
    return success(undefined);
  }

  public restoreFocus(amount: number): void {
    this.koffeinPegel = this.koffeinPegel.restore(amount);
  }
}
