import { SoundPropagationQueryHandler } from '../../src/acoustics/ports/in/SoundPropagationQueryHandler';
import { SoundPropagation, AcousticTopology } from '../../src/acoustics/SoundPropagation';
import { Coordinate } from '../../src/optics/Coordinate';
import { AcousticImpedance } from '../../src/acoustics/AcousticImpedance';

class MockAcousticTopology implements AcousticTopology {
  getImpedance(coord: Coordinate): AcousticImpedance {
    return AcousticImpedance.create(1.0)._unsafeUnwrap();
  }
}

describe('SoundPropagationQueryHandler', () => {
  it('should calculate hearing range successfully', () => {
    const topology = new MockAcousticTopology();
    const propagation = new SoundPropagation(topology);
    const handler = new SoundPropagationQueryHandler(propagation);

    const result = handler.execute({
      originX: 0,
      originY: 0,
      originZ: 0,
      sourceDb: 5,
      thresholdDb: 0
    });

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.audibleCells.length).toBeGreaterThan(0);
      expect(result.value.audibleCells).toContainEqual({ x: 0, y: 0, z: 0 });
    }
  });

});
