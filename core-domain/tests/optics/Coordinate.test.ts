import { Coordinate } from '../../src/optics/Coordinate';

describe('Coordinate Value Object', () => {
  it('should create a valid Coordinate', () => {
    const result = Coordinate.create(10, -5, 0);
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.x).toBe(10);
      expect(result.value.y).toBe(-5);
      expect(result.value.z).toBe(0);
    }
  });

  it('should default z to 0 if not provided', () => {
    const result = Coordinate.create(5, 5);
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.z).toBe(0);
    }
  });
  
  it('should calculate distance correctly', () => {
    const p1 = Coordinate.create(0, 0)._unsafeUnwrap();
    const p2 = Coordinate.create(3, 4)._unsafeUnwrap();
    expect(p1.distanceTo(p2)).toBeCloseTo(5);
  });
});
