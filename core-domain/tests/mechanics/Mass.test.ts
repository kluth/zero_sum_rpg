import { Mass } from '../../src/mechanics/Mass';

describe('Mass Value Object', () => {
  it('should create a valid Mass in kg', () => {
    const result = Mass.create(75.5);
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.kg).toBe(75.5);
    }
  });

  it('should fail when mass is negative', () => {
    const result = Mass.create(-5.0);
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.message).toBe('Mass cannot be negative');
    }
  });
});
