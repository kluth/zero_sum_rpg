import { WorkforceBase } from '../../src/workforce/WorkforceBase';
import { Nervenkostuem } from '../../src/workforce/Nervenkostuem';
import { BurnoutMeter } from '../../src/workforce/BurnoutMeter';
import { KoffeinPegel } from '../../src/workforce/KoffeinPegel';

class TestWorkforce extends WorkforceBase {
  // Concrete implementation for testing
}

describe('WorkforceBase', () => {
  const createCharacter = () => {
    const nr = Nervenkostuem.create(100);
    const br = BurnoutMeter.create(0);
    const kr = KoffeinPegel.create(100);
    
    if (nr.isSuccess() && br.isSuccess() && kr.isSuccess()) {
      return new TestWorkforce('char-1', 'Test Nurse', nr.value, br.value, kr.value);
    }
    throw new Error('Failed to create dependencies');
  };

  it('should initialize with correct attributes', () => {
    const char = createCharacter();
    expect(char.id).toBe('char-1');
    expect(char.name).toBe('Test Nurse');
    expect(char.getNervenkostuem().getValue()).toBe(100);
    expect(char.getBurnoutMeter().getValue()).toBe(0);
    expect(char.getKoffeinPegel().getValue()).toBe(100);
  });

  it('should handle damage and healing', () => {
    const char = createCharacter();
    char.takeDamage(30);
    expect(char.getNervenkostuem().getValue()).toBe(70);
    
    char.heal(10);
    expect(char.getNervenkostuem().getValue()).toBe(80);
  });

  it('should handle stress and trigger domain events', () => {
    const char = createCharacter();
    const result = char.applyStress(85);
    
    expect(result.isSuccess()).toBe(true);
    expect(char.getBurnoutMeter().getValue()).toBe(85);
    
    const events = char.getDomainEvents();
    expect(events.length).toBe(1);
    expect(events[0].eventName).toBe('BurnoutWarningThresholdReachedEvent');
  });

  it('should fail when stress reaches 100', () => {
    const char = createCharacter();
    const result = char.applyStress(100);
    
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.error).toContain('suffered a burnout');
    }
  });

  it('should execute SOP and consume focus', () => {
    const char = createCharacter();
    const result = char.executeSop(40);
    
    expect(result.isSuccess()).toBe(true);
    expect(char.getKoffeinPegel().getValue()).toBe(60);
  });

  it('should fail to execute SOP if not enough focus', () => {
    const char = createCharacter();
    char.executeSop(90); // 10 left
    const result = char.executeSop(20);
    
    expect(result.isFailure()).toBe(true);
  });
});
