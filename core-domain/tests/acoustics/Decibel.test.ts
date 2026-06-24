import { Decibel } from '../../src/acoustics/Decibel';

describe('Decibel Value Object', () => {
  it('should create a valid Decibel value', () => {
    const result = Decibel.create(60.0);
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.db).toBe(60.0);
    }
  });

  it('should allow negative dB (below threshold of hearing)', () => {
    const result = Decibel.create(-10.0);
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.db).toBe(-10.0);
    }
  });
  
  it('should allow addition of dB correctly', () => {
    const d1 = Decibel.create(50)._unsafeUnwrap();
    const d2 = Decibel.create(10)._unsafeUnwrap();
    const sum = d1.add(d2);
    expect(sum.db).toBe(60);
  });

  it('should allow subtraction of dB correctly', () => {
    const d1 = Decibel.create(50)._unsafeUnwrap();
    const d2 = Decibel.create(20)._unsafeUnwrap();
    const diff = d1.subtract(d2);
    expect(diff.db).toBe(30);
  });
});
