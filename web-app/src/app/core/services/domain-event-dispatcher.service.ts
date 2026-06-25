import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { DomainEvent } from '../events/DomainEvent';

@Injectable({
  providedIn: 'root'
})
export class DomainEventDispatcher {
  private eventSubject = new Subject<DomainEvent>();

  public publish(event: DomainEvent): void {
    this.eventSubject.next(event);
  }

  public subscribe<T extends DomainEvent>(eventName: string): Observable<T> {
    return this.eventSubject.asObservable().pipe(
      filter(event => event.eventName === eventName)
    ) as Observable<T>;
  }

  public publishAll(events: DomainEvent[]): void {
    events.forEach(event => this.publish(event));
  }
}
