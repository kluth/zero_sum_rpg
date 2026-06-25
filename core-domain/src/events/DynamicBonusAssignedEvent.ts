import { DomainEvent } from './DomainEvent';

export class DynamicBonusAssignedEvent implements DomainEvent {
  public readonly occurredOn: Date;
  public readonly eventName: string = 'DynamicBonusAssignedEvent';

  constructor(
    public readonly characterId: string,
    public readonly skill: string,
    public readonly modifier: number,
    public readonly reason: string
  ) {
    this.occurredOn = new Date();
  }
}
