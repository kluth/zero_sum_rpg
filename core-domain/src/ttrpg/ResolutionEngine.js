"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResolutionEngine = exports.DegreeOfSuccess = void 0;
var DegreeOfSuccess;
(function (DegreeOfSuccess) {
    DegreeOfSuccess["CRITICAL_FAILURE"] = "CRITICAL_FAILURE";
    DegreeOfSuccess["MIXED_SUCCESS"] = "MIXED_SUCCESS";
    DegreeOfSuccess["CLEAN_SUCCESS"] = "CLEAN_SUCCESS";
    DegreeOfSuccess["CRITICAL_TRIUMPH"] = "CRITICAL_TRIUMPH"; // 20+
})(DegreeOfSuccess || (exports.DegreeOfSuccess = DegreeOfSuccess = {}));
class ResolutionEngine {
    /**
     * Resolves an action using the new strict Bounded Accuracy (d20) system.
     * Runs in true O(1) time.
     */
    static resolve(request, randomProvider = Math.random) {
        // 1. Cap modifiers to prevent power-creep (Bounded Accuracy)
        const clampedModifier = Math.max(-5, Math.min(5, request.baseModifier));
        const clampedPenalty = Math.max(0, request.difficultyPenalty);
        // 2. Execute natural roll (1 to 20)
        const naturalRoll = Math.floor(randomProvider() * 20) + 1;
        // 3. Calculate Final Total
        const finalTotal = naturalRoll + clampedModifier - clampedPenalty;
        // 4. Determine Degree of Success
        let degree;
        const consequences = [];
        if (finalTotal < 10) {
            degree = DegreeOfSuccess.CRITICAL_FAILURE;
            consequences.push('ACTION_FAILED', 'SNR_INCREASED');
        }
        else if (finalTotal <= 15) {
            degree = DegreeOfSuccess.MIXED_SUCCESS;
            consequences.push('ACTION_SUCCEEDED', 'COMPLICATION_ADDED');
        }
        else if (finalTotal <= 19) {
            degree = DegreeOfSuccess.CLEAN_SUCCESS;
            consequences.push('ACTION_SUCCEEDED');
        }
        else {
            degree = DegreeOfSuccess.CRITICAL_TRIUMPH;
            consequences.push('ACTION_SUCCEEDED', 'MOMENTUM_GAINED', 'AP_REFUNDED');
        }
        return {
            rollValue: naturalRoll,
            finalTotal,
            degree,
            consequences
        };
    }
}
exports.ResolutionEngine = ResolutionEngine;
//# sourceMappingURL=ResolutionEngine.js.map