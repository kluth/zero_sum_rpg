import { CalculateFOVQueryHandler } from '../../src/optics/ports/in/CalculateFOVQueryHandler';
import { Shadowcaster, OpticalTopology } from '../../src/optics/Shadowcaster';
import { Coordinate } from '../../src/optics/Coordinate';
import { OpticalImpedance } from '../../src/optics/OpticalImpedance';

class MockTopology implements OpticalTopology {
  getImpedance(coord: Coordinate): OpticalImpedance {
    return OpticalImpedance.create(0.0)._unsafeUnwrap();
  }
}

describe('CalculateFOVQueryHandler', () => {
  it('should successfully calculate FOV and return coordinates', () => {
    const topology = new MockTopology();
    const shadowcaster = new Shadowcaster(topology);
    const handler = new CalculateFOVQueryHandler(shadowcaster);

    const result = handler.execute({
      originX: 0,
      originY: 0,
      range: 2
    });

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.visibleCells.length).toBeGreaterThan(0);
      expect(result.value.visibleCells).toContainEqual({ x: 0, y: 0 });
      expect(result.value.visibleCells).toContainEqual({ x: 1, y: 1 });
    }
  });

  it('should return error if range is negative', () => {
    const topology = new MockTopology();
    const shadowcaster = new Shadowcaster(topology);
    const handler = new CalculateFOVQueryHandler(shadowcaster);

    const result = handler.execute({
      originX: 0,
      originY: 0,
      range: -1
    });

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.message).toBe('Range cannot be negative');
    }
  });
});
