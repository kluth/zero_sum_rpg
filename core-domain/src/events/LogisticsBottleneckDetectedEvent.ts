import { DomainEvent } from './DomainEvent';

export class LogisticsBottleneckDetectedEvent implements DomainEvent {
  public readonly occurredOn: Date;
  public readonly eventName: string = 'LogisticsBottleneckDetectedEvent';

  constructor(
    public readonly facilityId: string,
    public readonly missingItem: string,
    public readonly severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  ) {
    this.occurredOn = new Date();
  }
}
