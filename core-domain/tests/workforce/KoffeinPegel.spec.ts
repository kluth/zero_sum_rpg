import { KoffeinPegel } from '../../src/workforce/KoffeinPegel';

describe('KoffeinPegel', () => {
  it('should create a valid KoffeinPegel', () => {
    const result = KoffeinPegel.create(50);
    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      expect(result.value.getValue()).toBe(50);
    }
  });

  it('should fail to create if value is less than 0', () => {
    const result = KoffeinPegel.create(-5);
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.error).toBe('KoffeinPegel value must be between 0 and 100.');
    }
  });

  it('should check if enough focus is available', () => {
    const pegel = KoffeinPegel.create(30);
    if (pegel.isSuccess()) {
      expect(pegel.value.hasEnough(20)).toBe(true);
      expect(pegel.value.hasEnough(40)).toBe(false);
    }
  });

  it('should consume focus if enough is available', () => {
    const pegel = KoffeinPegel.create(30);
    if (pegel.isSuccess()) {
      const consumed = pegel.value.consume(20);
      expect(consumed.isSuccess()).toBe(true);
      if (consumed.isSuccess()) {
        expect(consumed.value.getValue()).toBe(10);
      }
    }
  });

  it('should fail to consume focus if not enough is available', () => {
    const pegel = KoffeinPegel.create(30);
    if (pegel.isSuccess()) {
      const consumed = pegel.value.consume(40);
      expect(consumed.isFailure()).toBe(true);
      if (consumed.isFailure()) {
        expect(consumed.error).toBe('Not enough KoffeinPegel.');
      }
    }
  });

  it('should restore focus up to 100', () => {
    const pegel = KoffeinPegel.create(90);
    if (pegel.isSuccess()) {
      const restored = pegel.value.restore(20);
      expect(restored.getValue()).toBe(100);
    }
  });
});
