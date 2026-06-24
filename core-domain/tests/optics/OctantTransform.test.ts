import { OctantTransform } from '../../src/optics/OctantTransform';
import { Coordinate } from '../../src/optics/Coordinate';

describe('OctantTransform', () => {
  const origin = Coordinate.create(10, 10)._unsafeUnwrap();

  it('should transform correctly for Octant 0 (NNE)', () => {
    const transform = new OctantTransform(0);
    // In octant 0: x = origin.x + col, y = origin.y - row
    const result = transform.transform(origin, 5, 2); // row 5, col 2
    expect(result.x).toBe(12);
    expect(result.y).toBe(5);
  });

  it('should transform correctly for Octant 1 (ENE)', () => {
    const transform = new OctantTransform(1);
    // In octant 1: x = origin.x + row, y = origin.y - col
    const result = transform.transform(origin, 5, 2); // row 5, col 2
    expect(result.x).toBe(15);
    expect(result.y).toBe(8);
  });
  
  it('should throw an error if octant is invalid', () => {
    expect(() => new OctantTransform(8)).toThrow('Invalid octant: 8');
  });
});
