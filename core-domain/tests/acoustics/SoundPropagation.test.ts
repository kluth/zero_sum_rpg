import { SoundPropagation, AcousticTopology } from '../../src/acoustics/SoundPropagation';
import { Coordinate } from '../../src/optics/Coordinate';
import { AcousticImpedance } from '../../src/acoustics/AcousticImpedance';
import { Decibel } from '../../src/acoustics/Decibel';

class MockAcousticTopology implements AcousticTopology {
  private obstacles: Set<string> = new Set();

  setObstacle(x: number, y: number) {
    this.obstacles.add(`${x},${y}`);
  }

  getImpedance(coord: Coordinate): AcousticImpedance {
    const isObstacle = this.obstacles.has(`${coord.x},${coord.y}`);
    return AcousticImpedance.create(isObstacle ? 20.0 : 0.5)._unsafeUnwrap(); // 20dB loss for obstacle, 0.5dB for air
  }
}

describe('SoundPropagation', () => {
  it('should propagate sound until it falls below threshold', () => {
    const topology = new MockAcousticTopology();
    const propagation = new SoundPropagation(topology);
    const origin = Coordinate.create(0, 0, 0)._unsafeUnwrap();
    const sourceDb = Decibel.create(10)._unsafeUnwrap();
    const threshold = Decibel.create(0)._unsafeUnwrap();
    
    const audibleCells = propagation.computeHearingRange(origin, sourceDb, threshold);
    
    // With 10dB and 0.5dB loss per meter (approx per cell), it should travel quite a bit.
    // Let's just assert it includes the origin and some neighbors.
    expect(audibleCells.length).toBeGreaterThan(0);
    expect(audibleCells.some(c => c.x === 0 && c.y === 0)).toBe(true);
    expect(audibleCells.some(c => c.x === 1 && c.y === 0)).toBe(true);
  });

  it('should block sound abruptly behind an obstacle', () => {
    const topology = new MockAcousticTopology();
    // Wall of obstacles to the east
    topology.setObstacle(1, -1);
    topology.setObstacle(1, 0);
    topology.setObstacle(1, 1);
    
    const propagation = new SoundPropagation(topology);
    const origin = Coordinate.create(0, 0, 0)._unsafeUnwrap();
    const sourceDb = Decibel.create(2)._unsafeUnwrap(); // Source is 2dB
    const threshold = Decibel.create(0)._unsafeUnwrap();
    
    const audibleCells = propagation.computeHearingRange(origin, sourceDb, threshold);
    
    // (1,0) is an obstacle with 20dB impedance. Since source is 15dB, sound shouldn't penetrate past it well
    // It takes 20dB away. 15 - 20 = -5dB which is < 0dB threshold.
    // So (2,0) shouldn't be audible
    expect(audibleCells.some(c => c.x === 2 && c.y === 0)).toBe(false);
  });
});
