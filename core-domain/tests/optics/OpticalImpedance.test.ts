import { OpticalImpedance } from '../../src/optics/OpticalImpedance';

describe('OpticalImpedance Value Object', () => {
  it('should create a valid OpticalImpedance when value is between 0 and 1', () => {
    const result = OpticalImpedance.create(0.5);
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.value).toBe(0.5);
    }
  });

  it('should allow 0 (transparent) and 1 (opaque)', () => {
    expect(OpticalImpedance.create(0).isOk()).toBe(true);
    expect(OpticalImpedance.create(1).isOk()).toBe(true);
  });

  it('should fail when value is less than 0', () => {
    const result = OpticalImpedance.create(-0.1);
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.message).toBe('OpticalImpedance must be between 0.0 and 1.0');
    }
  });

  it('should fail when value is greater than 1', () => {
    const result = OpticalImpedance.create(1.1);
    expect(result.isErr()).toBe(true);
  });
});
