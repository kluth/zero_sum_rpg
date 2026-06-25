import { BurnoutMeter } from '../../src/workforce/BurnoutMeter';

describe('BurnoutMeter', () => {
  it('should create a valid BurnoutMeter', () => {
    const result = BurnoutMeter.create(50);
    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      expect(result.value.getValue()).toBe(50);
    }
  });

  it('should fail to create if value is less than 0', () => {
    const result = BurnoutMeter.create(-1);
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.error).toBe('BurnoutMeter value must be between 0 and 100.');
    }
  });

  it('should fail to create if value is greater than 100', () => {
    const result = BurnoutMeter.create(101);
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.error).toBe('BurnoutMeter value must be between 0 and 100.');
    }
  });

  it('should identify critical stress levels (>= 80)', () => {
    const critical = BurnoutMeter.create(80);
    expect(critical.isSuccess()).toBe(true);
    if (critical.isSuccess()) {
      expect(critical.value.isCritical()).toBe(true);
      expect(critical.value.isBurnout()).toBe(false);
    }

    const notCritical = BurnoutMeter.create(79);
    expect(notCritical.isSuccess()).toBe(true);
    if (notCritical.isSuccess()) {
      expect(notCritical.value.isCritical()).toBe(false);
    }
  });

  it('should identify burnout stress levels (== 100)', () => {
    const burnout = BurnoutMeter.create(100);
    expect(burnout.isSuccess()).toBe(true);
    if (burnout.isSuccess()) {
      expect(burnout.value.isCritical()).toBe(true);
      expect(burnout.value.isBurnout()).toBe(true);
    }
  });

  it('should increase stress level and cap at 100', () => {
    const result = BurnoutMeter.create(90);
    if (result.isSuccess()) {
      const increased = result.value.increase(20);
      expect(increased.getValue()).toBe(100);
      expect(increased.isBurnout()).toBe(true);
    }
  });

  it('should decrease stress level and cap at 0', () => {
    const result = BurnoutMeter.create(10);
    if (result.isSuccess()) {
      const decreased = result.value.decrease(20);
      expect(decreased.getValue()).toBe(0);
    }
  });
});
