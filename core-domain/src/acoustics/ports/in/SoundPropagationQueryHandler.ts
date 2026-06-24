import { Result, ok, err } from 'neverthrow';
import { SoundPropagation } from '../../SoundPropagation';
import { Coordinate } from '../../../optics/Coordinate';
import { Decibel } from '../../Decibel';

export interface SoundPropagationQuery {
  originX: number;
  originY: number;
  originZ: number;
  sourceDb: number;
  thresholdDb: number;
}

export interface SoundPropagationResult {
  audibleCells: { x: number; y: number; z: number }[];
}

export class InvalidSoundQueryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidSoundQueryError';
  }
}

export class SoundPropagationQueryHandler {
  constructor(private readonly propagation: SoundPropagation) {}

  public execute(query: SoundPropagationQuery): Result<SoundPropagationResult, InvalidSoundQueryError> {
    const originResult = Coordinate.create(query.originX, query.originY, query.originZ);
    if (originResult.isErr()) {
      return err(new InvalidSoundQueryError('Invalid origin coordinates'));
    }

    const sourceDbResult = Decibel.create(query.sourceDb);
    if (sourceDbResult.isErr()) {
      return err(new InvalidSoundQueryError('Invalid source decibel'));
    }

    const thresholdDbResult = Decibel.create(query.thresholdDb);
    if (thresholdDbResult.isErr()) {
      return err(new InvalidSoundQueryError('Invalid threshold decibel'));
    }

    const audibleCoordinates = this.propagation.computeHearingRange(
      originResult.value,
      sourceDbResult.value,
      thresholdDbResult.value
    );
    
    const audibleCells = audibleCoordinates.map(coord => ({
      x: coord.x,
      y: coord.y,
      z: coord.z
    }));

    return ok({ audibleCells });
  }
}
