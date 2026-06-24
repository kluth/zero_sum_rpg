import { Result } from '../shared/Result';
export declare enum ActionType {
    MOVE = "MOVE",
    ATTACK = "ATTACK",
    HACK_ICE = "HACK_ICE",
    CATCH_BREATH = "CATCH_BREATH",// V2.1 Fix: AP Recovery
    ACCEPT_FLAW = "ACCEPT_FLAW",// V2.1 Fix: Narrative Complication for AP
    SYNC_BREACH = "SYNC_BREACH",// V2.1 Fix: Split-Party Group Action
    INTERACT = "INTERACT"
}
export interface ActionPayloadDTO {
    readonly actionId: string;
    readonly playerId: string;
    readonly type: ActionType;
    readonly apCost: number;
    readonly contextTags: ReadonlyArray<string>;
    readonly targetId?: string;
    readonly targetCoordinates?: {
        readonly x: number;
        readonly y: number;
        readonly z: number;
    };
}
export declare class ActionParser {
    static parse(raw: unknown): Result<ActionPayloadDTO, Error>;
}
//# sourceMappingURL=PlayerActionDTO.d.ts.map