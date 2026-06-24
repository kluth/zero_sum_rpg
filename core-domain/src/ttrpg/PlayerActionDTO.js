"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionParser = exports.ActionType = void 0;
const Result_1 = require("../shared/Result");
var ActionType;
(function (ActionType) {
    ActionType["MOVE"] = "MOVE";
    ActionType["ATTACK"] = "ATTACK";
    ActionType["HACK_ICE"] = "HACK_ICE";
    ActionType["CATCH_BREATH"] = "CATCH_BREATH";
    ActionType["ACCEPT_FLAW"] = "ACCEPT_FLAW";
    ActionType["SYNC_BREACH"] = "SYNC_BREACH";
    ActionType["INTERACT"] = "INTERACT";
})(ActionType || (exports.ActionType = ActionType = {}));
class ActionParser {
    static parse(raw) {
        if (!raw || typeof raw !== 'object') {
            return (0, Result_1.failure)(new Error("Invalid Action payload: Must be an object."));
        }
        const data = raw;
        if (!data.actionId || !data.playerId || !Object.values(ActionType).includes(data.type)) {
            return (0, Result_1.failure)(new Error("Invalid Action payload: Missing required fields or invalid ActionType."));
        }
        if (typeof data.apCost !== 'number' || data.apCost < 0 || data.apCost > 3) {
            return (0, Result_1.failure)(new Error("Invalid Action payload: apCost must be between 0 and 3."));
        }
        try {
            const dto = {
                actionId: String(data.actionId),
                playerId: String(data.playerId),
                type: data.type,
                apCost: data.apCost,
                contextTags: Array.isArray(data.contextTags) ? data.contextTags : [],
                targetId: data.targetId ? String(data.targetId) : undefined,
                targetCoordinates: data.targetCoordinates ? {
                    x: Number(data.targetCoordinates.x),
                    y: Number(data.targetCoordinates.y),
                    z: Number(data.targetCoordinates.z)
                } : undefined
            };
            return (0, Result_1.success)(dto);
        }
        catch (e) {
            return (0, Result_1.failure)(new Error(`Failed to parse Action: ${e}`));
        }
    }
}
exports.ActionParser = ActionParser;
//# sourceMappingURL=PlayerActionDTO.js.map