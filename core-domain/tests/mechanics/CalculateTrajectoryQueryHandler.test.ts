import { CalculateTrajectoryQueryHandler } from '../../src/mechanics/ports/in/CalculateTrajectoryQueryHandler';
import { Ballistics } from '../../src/mechanics/Ballistics';

describe('CalculateTrajectoryQueryHandler', () => {
  it('should return trajectory path', () => {
    const ballistics = new Ballistics();
    const handler = new CalculateTrajectoryQueryHandler(ballistics);

    const result = handler.execute({
      originX: 0,
      originY: 0,
      originZ: 0,
      velDx: 5,
      velDy: 0,
      velDz: 0,
      massKg: 10
    });

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.path.length).toBeGreaterThan(0);
    }
  });
});
