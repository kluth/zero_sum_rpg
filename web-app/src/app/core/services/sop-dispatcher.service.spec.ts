import { TestBed } from '@angular/core/testing';
import { SOPDispatcherService } from './sop-dispatcher.service';
import { DomainEventDispatcher } from './domain-event-dispatcher.service';
import { WorkforceBase } from '../../../../../core-domain/src/workforce/WorkforceBase';
import { Nervenkostuem } from '../../../../../core-domain/src/workforce/Nervenkostuem';
import { BurnoutMeter } from '../../../../../core-domain/src/workforce/BurnoutMeter';
import { KoffeinPegel } from '../../../../../core-domain/src/workforce/KoffeinPegel';
import { Result, success, failure } from '../../../../../core-domain/src/shared/Result';

class MockWorkforce extends WorkforceBase {
  public doSomethingSuccess(): Result<string, string> {
    this.addDomainEvent({ eventName: 'MockEvent', occurredOn: new Date() });
    return success('Success');
  }

  public doSomethingFailure(): Result<string, string> {
    this.addDomainEvent({ eventName: 'MockEventFailure', occurredOn: new Date() });
    return failure('Failed action');
  }
}

describe('SOPDispatcherService', () => {
  let service: SOPDispatcherService;
  let eventDispatcherSpy: jasmine.SpyObj<DomainEventDispatcher>;
  let mockEntity: MockWorkforce;

  beforeEach(() => {
    eventDispatcherSpy = jasmine.createSpyObj('DomainEventDispatcher', ['publishAll']);

    TestBed.configureTestingModule({
      providers: [
        SOPDispatcherService,
        { provide: DomainEventDispatcher, useValue: eventDispatcherSpy }
      ]
    });

    service = TestBed.inject(SOPDispatcherService);

    const nr = Nervenkostuem.create(100);
    const br = BurnoutMeter.create(0);
    const kr = KoffeinPegel.create(100);
    
    if (nr.isSuccess() && br.isSuccess() && kr.isSuccess()) {
      mockEntity = new MockWorkforce('mock-1', 'Mock', nr.value, br.value, kr.value);
    } else {
      throw new Error('Failed to create dependencies');
    }
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should execute action, publish events, and clear them on success', () => {
    const result = service.dispatch(mockEntity, (e) => e.doSomethingSuccess());

    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      expect(result.value).toBe('Success');
    }
    
    expect(eventDispatcherSpy.publishAll).toHaveBeenCalled();
    expect(mockEntity.getDomainEvents().length).toBe(0);
  });

  it('should not publish events on failure', () => {
    const result = service.dispatch(mockEntity, (e) => e.doSomethingFailure());

    expect(result.isFailure()).toBe(true);
    expect(eventDispatcherSpy.publishAll).not.toHaveBeenCalled();
    // Events are not cleared on failure so they can be handled or dropped appropriately later
    expect(mockEntity.getDomainEvents().length).toBe(1);
  });
});
