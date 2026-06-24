import { Ballistics } from '../../src/mechanics/Ballistics';
import { Coordinate } from '../../src/optics/Coordinate';
import { Velocity } from '../../src/mechanics/Velocity';
import { Mass } from '../../src/mechanics/Mass';

describe('Ballistics', () => {
  it('should calculate a basic linear trajectory', () => {
    const origin = Coordinate.create(0, 0, 0)._unsafeUnwrap();
    const velocity = Velocity.create(1, 1, 0)._unsafeUnwrap();
    const mass = Mass.create(10)._unsafeUnwrap();

    const ballistics = new Ballistics();
    const trajectory = ballistics.calculateTrajectory(origin, velocity, mass);

    // With velocity (1,1,0), next point should be (1,1,0), then (2,2,0)...
    expect(trajectory.path.length).toBeGreaterThan(0);
    expect(trajectory.path[1].x).toBe(1);
    expect(trajectory.path[1].y).toBe(1);
  });
});
