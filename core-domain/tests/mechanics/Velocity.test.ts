import { Velocity } from '../../src/mechanics/Velocity';

describe('Velocity Value Object', () => {
  it('should create a valid Velocity vector', () => {
    const result = Velocity.create(10.0, -5.0, 0.0);
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.dx).toBe(10.0);
      expect(result.value.dy).toBe(-5.0);
      expect(result.value.dz).toBe(0.0);
    }
  });

  it('should calculate magnitude correctly', () => {
    const velocity = Velocity.create(3.0, 4.0, 0.0)._unsafeUnwrap();
    expect(velocity.magnitude()).toBe(5.0);
  });
});
