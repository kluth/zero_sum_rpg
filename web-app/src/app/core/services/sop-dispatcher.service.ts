import { Injectable } from '@angular/core';
import { DomainEventDispatcher } from './domain-event-dispatcher.service';
import { DomainEvent } from '@core-domain/events/DomainEvent';
import { Result } from '@core-domain/shared/Result';

export interface HasDomainEvents {
  getDomainEvents(): DomainEvent[];
  clearDomainEvents(): void;
}

@Injectable({
  providedIn: 'root'
})
export class SOPDispatcherService {
  constructor(private eventDispatcher: DomainEventDispatcher) {}

  /**
   * Executes an action on a domain entity, and if successful, 
   * publishes any domain events that were generated during the action.
   */
  public dispatch<T extends HasDomainEvents, R>(
    entity: T,
    action: (entity: T) => Result<R, string>
  ): Result<R, string> {
    const result = action(entity);
    
    if (result.isSuccess()) {
      const events = entity.getDomainEvents();
      if (events.length > 0) {
        this.eventDispatcher.publishAll(events);
        entity.clearDomainEvents();
      }
    }
    
    return result;
  }
}
