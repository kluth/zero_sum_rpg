import { TestBed } from '@angular/core/testing';
import { UiIntegrationService } from './ui-integration.service';
import { DomainEventDispatcher } from './domain-event-dispatcher.service';
import { BurnoutWarningThresholdReachedEvent } from '../../../../../core-domain/src/events/BurnoutWarningThresholdReachedEvent';
import { LogisticsBottleneckDetectedEvent } from '../../../../../core-domain/src/events/LogisticsBottleneckDetectedEvent';

describe('UiIntegrationService', () => {
  let service: UiIntegrationService;
  let dispatcher: DomainEventDispatcher;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UiIntegrationService, DomainEventDispatcher]
    });
    service = TestBed.inject(UiIntegrationService);
    dispatcher = TestBed.inject(DomainEventDispatcher);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    expect(service.currentAlert()).toBeNull();
  });

  it('should update state when BurnoutWarningThresholdReachedEvent is published', () => {
    const event = new BurnoutWarningThresholdReachedEvent('char-1', 85, 80);
    dispatcher.publish(event);

    const alert = service.currentAlert();
    expect(alert).not.toBeNull();
    if (alert) {
      expect(alert.severity).toBe('CRITICAL');
      expect(alert.message).toContain('char-1');
      expect(alert.message).toContain('85');
    }
  });

  it('should update state when LogisticsBottleneckDetectedEvent is published', () => {
    const event = new LogisticsBottleneckDetectedEvent('fac-1', 'Medkit', 'WARNING');
    dispatcher.publish(event);

    const alert = service.currentAlert();
    expect(alert).not.toBeNull();
    if (alert) {
      expect(alert.severity).toBe('WARNING');
      expect(alert.message).toContain('Medkit');
    }
  });

  it('should clear alert', () => {
    const event = new BurnoutWarningThresholdReachedEvent('char-1', 85, 80);
    dispatcher.publish(event);
    expect(service.currentAlert()).not.toBeNull();

    service.clearAlert();
    expect(service.currentAlert()).toBeNull();
  });
});
