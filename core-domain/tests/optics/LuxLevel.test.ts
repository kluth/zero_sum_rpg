import { LuxLevel } from '../../src/optics/LuxLevel';

describe('LuxLevel Value Object', () => {
  it('should create a valid LuxLevel when lux is positive', () => {
    const result = LuxLevel.create(50.0);
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.lux).toBe(50.0);
    }
  });

  it('should fail when lux is negative', () => {
    const result = LuxLevel.create(-5);
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.message).toBe('LuxLevel cannot be negative');
    }
  });

  it('should allow zero lux (pitch black)', () => {
    const result = LuxLevel.create(0);
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.lux).toBe(0);
    }
  });
});
