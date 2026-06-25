import { TestBed } from '@angular/core/testing';
import { DomainEventDispatcher } from './domain-event-dispatcher.service';
import { DomainEvent } from '../../../../../core-domain/src/events/DomainEvent';

class TestEvent implements DomainEvent {
  public readonly occurredOn = new Date();
  public readonly eventName = 'TestEvent';
  constructor(public payload: string) {}
}

describe('DomainEventDispatcher', () => {
  let service: DomainEventDispatcher;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DomainEventDispatcher);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should publish and subscribe to events', (done) => {
    const testEvent = new TestEvent('hello world');

    service.subscribe<TestEvent>('TestEvent').subscribe(event => {
      expect(event.payload).toBe('hello world');
      expect(event.eventName).toBe('TestEvent');
      done();
    });

    service.publish(testEvent);
  });

  it('should not receive events of other types', () => {
    const nextSpy = jasmine.createSpy('next');
    service.subscribe<TestEvent>('OtherEvent').subscribe(nextSpy);

    service.publish(new TestEvent('hello world'));

    expect(nextSpy).not.toHaveBeenCalled();
  });

  it('should publish multiple events', () => {
    const nextSpy = jasmine.createSpy('next');
    service.subscribe<TestEvent>('TestEvent').subscribe(nextSpy);

    service.publishAll([
      new TestEvent('msg 1'),
      new TestEvent('msg 2')
    ]);

    expect(nextSpy).toHaveBeenCalledTimes(2);
  });
});
