import { DomainEvent } from './DomainEvent';

export class BurnoutWarningThresholdReachedEvent implements DomainEvent {
  public readonly occurredOn: Date;
  public readonly eventName: string = 'BurnoutWarningThresholdReachedEvent';

  constructor(
    public readonly characterId: string,
    public readonly currentBurnoutLevel: number,
    public readonly threshold: number
  ) {
    this.occurredOn = new Date();
  }
}
