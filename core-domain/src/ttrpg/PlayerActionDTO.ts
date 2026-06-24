import { Result, success, failure } from '../shared/Result';

export enum ActionType {
  MOVE = 'MOVE',
  ATTACK = 'ATTACK',
  HACK_ICE = 'HACK_ICE',
  CATCH_BREATH = 'CATCH_BREATH', // V2.1 Fix: AP Recovery
  ACCEPT_FLAW = 'ACCEPT_FLAW',   // V2.1 Fix: Narrative Complication for AP
  SYNC_BREACH = 'SYNC_BREACH',   // V2.1 Fix: Split-Party Group Action
  INTERACT = 'INTERACT'
}

export interface ActionPayloadDTO {
  readonly actionId: string;
  readonly playerId: string;
  readonly type: ActionType;
  readonly apCost: number;
  readonly contextTags: ReadonlyArray<string>; // e.g. ["under_fire", "stealth"]
  readonly targetId?: string;
  readonly targetCoordinates?: { readonly x: number, readonly y: number, readonly z: number };
}

export class ActionParser {
  public static parse(raw: unknown): Result<ActionPayloadDTO, Error> {
    if (!raw || typeof raw !== 'object') {
      return failure(new Error("Invalid Action payload: Must be an object."));
    }

    const data = raw as any;
    
    if (!data.actionId || !data.playerId || !Object.values(ActionType).includes(data.type)) {
      return failure(new Error("Invalid Action payload: Missing required fields or invalid ActionType."));
    }

    if (typeof data.apCost !== 'number' || data.apCost < 0 || data.apCost > 3) {
      return failure(new Error("Invalid Action payload: apCost must be between 0 and 3."));
    }

    try {
      const dto: ActionPayloadDTO = {
        actionId: String(data.actionId),
        playerId: String(data.playerId),
        type: data.type as ActionType,
        apCost: data.apCost,
        contextTags: Array.isArray(data.contextTags) ? data.contextTags : [],
        targetId: data.targetId ? String(data.targetId) : undefined,
        targetCoordinates: data.targetCoordinates ? {
          x: Number(data.targetCoordinates.x),
          y: Number(data.targetCoordinates.y),
          z: Number(data.targetCoordinates.z)
        } : undefined
      };

      return success(dto);
    } catch (e) {
      return failure(new Error(`Failed to parse Action: ${e}`));
    }
  }
}
