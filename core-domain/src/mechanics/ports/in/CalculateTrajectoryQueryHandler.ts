import { Result, ok, err } from 'neverthrow';
import { Ballistics } from '../../Ballistics';
import { Coordinate } from '../../../optics/Coordinate';
import { Velocity } from '../../Velocity';
import { Mass } from '../../Mass';

export interface CalculateTrajectoryQuery {
  originX: number;
  originY: number;
  originZ: number;
  velDx: number;
  velDy: number;
  velDz: number;
  massKg: number;
}

export interface CalculateTrajectoryResult {
  path: { x: number; y: number; z: number }[];
  collisionPoint: { x: number; y: number; z: number } | null;
}

export class CalculateTrajectoryQueryHandler {
  constructor(private readonly ballistics: Ballistics) {}

  public execute(query: CalculateTrajectoryQuery): Result<CalculateTrajectoryResult, Error> {
    const originResult = Coordinate.create(query.originX, query.originY, query.originZ);
    if (originResult.isErr()) return err(new Error('Invalid origin'));

    const velocityResult = Velocity.create(query.velDx, query.velDy, query.velDz);
    if (velocityResult.isErr()) return err(new Error('Invalid velocity'));

    const massResult = Mass.create(query.massKg);
    if (massResult.isErr()) return err(massResult.error);

    const trajectory = this.ballistics.calculateTrajectory(
      originResult.value,
      velocityResult.value,
      massResult.value
    );

    return ok({
      path: trajectory.path.map(c => ({ x: c.x, y: c.y, z: c.z })),
      collisionPoint: trajectory.collisionPoint ? { x: trajectory.collisionPoint.x, y: trajectory.collisionPoint.y, z: trajectory.collisionPoint.z } : null
    });
  }
}
