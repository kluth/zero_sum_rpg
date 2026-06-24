export declare enum DegreeOfSuccess {
    CRITICAL_FAILURE = "CRITICAL_FAILURE",// 1-9
    MIXED_SUCCESS = "MIXED_SUCCESS",// 10-15
    CLEAN_SUCCESS = "CLEAN_SUCCESS",// 16-19
    CRITICAL_TRIUMPH = "CRITICAL_TRIUMPH"
}
export interface RollRequest {
    readonly playerId: string;
    readonly baseModifier: number;
    readonly difficultyPenalty: number;
}
export interface RollResult {
    readonly rollValue: number;
    readonly finalTotal: number;
    readonly degree: DegreeOfSuccess;
    readonly consequences: string[];
}
export declare class ResolutionEngine {
    /**
     * Resolves an action using the new strict Bounded Accuracy (d20) system.
     * Runs in true O(1) time.
     */
    static resolve(request: RollRequest, randomProvider?: () => number): RollResult;
}
//# sourceMappingURL=ResolutionEngine.d.ts.map