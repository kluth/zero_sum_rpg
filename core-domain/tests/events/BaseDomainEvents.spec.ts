import { BurnoutWarningThresholdReachedEvent } from '../../src/events/BurnoutWarningThresholdReachedEvent';
import { LogisticsBottleneckDetectedEvent } from '../../src/events/LogisticsBottleneckDetectedEvent';
import { DynamicBonusAssignedEvent } from '../../src/events/DynamicBonusAssignedEvent';

describe('Domain Events', () => {
  it('should create BurnoutWarningThresholdReachedEvent with correct payload', () => {
    const event = new BurnoutWarningThresholdReachedEvent('char-1', 85, 80);
    
    expect(event.eventName).toBe('BurnoutWarningThresholdReachedEvent');
    expect(event.characterId).toBe('char-1');
    expect(event.currentBurnoutLevel).toBe(85);
    expect(event.threshold).toBe(80);
    expect(event.occurredOn).toBeInstanceOf(Date);
  });

  it('should create LogisticsBottleneckDetectedEvent with correct payload', () => {
    const event = new LogisticsBottleneckDetectedEvent('fac-1', 'Medkit', 'HIGH');
    
    expect(event.eventName).toBe('LogisticsBottleneckDetectedEvent');
    expect(event.facilityId).toBe('fac-1');
    expect(event.missingItem).toBe('Medkit');
    expect(event.severity).toBe('HIGH');
    expect(event.occurredOn).toBeInstanceOf(Date);
  });
  it('should create DynamicBonusAssignedEvent with correct payload', () => {
    const event = new DynamicBonusAssignedEvent('char-1', 'Wundversorgung', 1, 'GM Award');
    
    expect(event.eventName).toBe('DynamicBonusAssignedEvent');
    expect(event.characterId).toBe('char-1');
    expect(event.skill).toBe('Wundversorgung');
    expect(event.modifier).toBe(1);
    expect(event.reason).toBe('GM Award');
    expect(event.occurredOn).toBeInstanceOf(Date);
  });
});
