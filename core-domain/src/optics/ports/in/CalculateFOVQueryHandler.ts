import { Result, ok, err } from 'neverthrow';
import { Shadowcaster } from '../../Shadowcaster';
import { Coordinate } from '../../Coordinate';

export interface CalculateFOVQuery {
  originX: number;
  originY: number;
  range: number;
}

export interface CalculateFOVResult {
  visibleCells: { x: number; y: number }[];
}

export class InvalidQueryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidQueryError';
  }
}

export class CalculateFOVQueryHandler {
  constructor(private readonly shadowcaster: Shadowcaster) {}

  public execute(query: CalculateFOVQuery): Result<CalculateFOVResult, InvalidQueryError> {
    if (query.range < 0) {
      return err(new InvalidQueryError('Range cannot be negative'));
    }

    const originResult = Coordinate.create(query.originX, query.originY, 0);
    if (originResult.isErr()) {
      return err(new InvalidQueryError('Invalid origin coordinates'));
    }

    const visibleCoordinates = this.shadowcaster.computeFov(originResult.value, query.range);
    
    const visibleCells = visibleCoordinates.map(coord => ({
      x: coord.x,
      y: coord.y
    }));

    return ok({ visibleCells });
  }
}
