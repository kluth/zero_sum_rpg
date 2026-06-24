import { LuminousFlux } from '../../src/optics/LuminousFlux';

describe('LuminousFlux Value Object', () => {
  it('should create a valid LuminousFlux when lumen is positive', () => {
    const result = LuminousFlux.create(100.5);
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.lumen).toBe(100.5);
    }
  });

  it('should fail when lumen is negative', () => {
    const result = LuminousFlux.create(-10);
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.message).toBe('LuminousFlux cannot be negative');
    }
  });

  it('should allow zero lumen (darkness)', () => {
    const result = LuminousFlux.create(0);
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.lumen).toBe(0);
    }
  });
});
