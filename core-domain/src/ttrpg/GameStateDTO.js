"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameStateParser = exports.CellType = exports.ThreatLevel = void 0;
const Result_1 = require("../shared/Result");
/**
 * UBIQUITOUS LANGUAGE:
 * ThreatLevel: The current operational danger of a Room or Sector.
 * AP (Action Point): The bounded economy for character actions (Max 3).
 * SNR (Signal-to-Noise Ratio): The stealth metric. Higher SNR = higher chance of detection.
 */
var ThreatLevel;
(function (ThreatLevel) {
    ThreatLevel["IDLE"] = "IDLE";
    ThreatLevel["ELEVATED"] = "ELEVATED";
    ThreatLevel["CRITICAL"] = "CRITICAL";
    ThreatLevel["COMPROMISED"] = "COMPROMISED";
})(ThreatLevel || (exports.ThreatLevel = ThreatLevel = {}));
var CellType;
(function (CellType) {
    CellType["EMPTY"] = "empty";
    CellType["WALL"] = "wall";
    CellType["FLOOR"] = "floor";
    CellType["DOOR_OPEN"] = "door_open";
    CellType["DOOR_LOCKED"] = "door_locked";
    CellType["CCTV"] = "cctv";
    CellType["FURNITURE"] = "furniture";
    CellType["STRUCTURE_WALL"] = "structure_wall";
    CellType["BREAKABLE_WALL"] = "breakable_wall";
    CellType["CUPBOARD"] = "cupboard";
    CellType["STORAGE_BOX"] = "storage_box";
    CellType["SERVER_RACK"] = "server_rack";
    CellType["CHAIR"] = "chair";
    CellType["BED"] = "bed";
    CellType["LOCKER"] = "locker";
    CellType["SOFA"] = "sofa";
    CellType["PLANT"] = "plant";
    CellType["TABLE"] = "table";
    CellType["MONITOR"] = "monitor";
    CellType["TECH_SCRAP"] = "tech_scrap";
    CellType["PRESSURE_PLATE"] = "pressure_plate";
    CellType["WEAPON_RACK"] = "weapon_rack";
    CellType["AMMO_CRATE"] = "ammo_crate";
    CellType["MEDICAL_BED"] = "medical_bed";
    CellType["AUTODOC"] = "autodoc";
    CellType["TURRET"] = "turret";
    CellType["GENERATOR"] = "generator";
    CellType["BIO_SCANNER"] = "bio_scanner";
})(CellType || (exports.CellType = CellType = {}));
class GameStateParser {
    /**
     * Validates raw JSON into a strict GameStateDTO using the Result pattern.
     * Enforces Contract-First integrity.
     */
    static parse(raw) {
        if (!raw || typeof raw !== 'object') {
            return (0, Result_1.failure)(new Error("Invalid GameState payload: Must be an object."));
        }
        const state = raw;
        if (!state.mapDimensions || typeof state.mapDimensions.width !== 'number') {
            return (0, Result_1.failure)(new Error("Invalid GameState payload: Missing or invalid mapDimensions."));
        }
        // In a real Hexagonal architecture, we'd use Zod or Joi here.
        // For this increment, we manually construct the DTO to strip unknown fields (Defensive Copy).
        try {
            const dto = {
                mapDimensions: {
                    width: state.mapDimensions.width,
                    height: state.mapDimensions.height
                },
                cells: state.cells || {},
                rooms: state.rooms || {},
                globalHeat: typeof state.globalHeat === 'number' ? state.globalHeat : 0
            };
            return (0, Result_1.success)(dto);
        }
        catch (e) {
            return (0, Result_1.failure)(new Error(`Failed to parse GameState: ${e}`));
        }
    }
}
exports.GameStateParser = GameStateParser;
//# sourceMappingURL=GameStateDTO.js.map