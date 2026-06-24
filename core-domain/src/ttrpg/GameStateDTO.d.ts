import { Result } from '../shared/Result';
/**
 * UBIQUITOUS LANGUAGE:
 * ThreatLevel: The current operational danger of a Room or Sector.
 * AP (Action Point): The bounded economy for character actions (Max 3).
 * SNR (Signal-to-Noise Ratio): The stealth metric. Higher SNR = higher chance of detection.
 */
export declare enum ThreatLevel {
    IDLE = "IDLE",
    ELEVATED = "ELEVATED",
    CRITICAL = "CRITICAL",
    COMPROMISED = "COMPROMISED"
}
export declare enum CellType {
    EMPTY = "empty",
    WALL = "wall",
    FLOOR = "floor",
    DOOR_OPEN = "door_open",
    DOOR_LOCKED = "door_locked",
    CCTV = "cctv",
    FURNITURE = "furniture",
    STRUCTURE_WALL = "structure_wall",
    BREAKABLE_WALL = "breakable_wall",
    CUPBOARD = "cupboard",
    STORAGE_BOX = "storage_box",
    SERVER_RACK = "server_rack",
    CHAIR = "chair",
    BED = "bed",
    LOCKER = "locker",
    SOFA = "sofa",
    PLANT = "plant",
    TABLE = "table",
    MONITOR = "monitor",
    TECH_SCRAP = "tech_scrap",
    PRESSURE_PLATE = "pressure_plate",
    WEAPON_RACK = "weapon_rack",
    AMMO_CRATE = "ammo_crate",
    MEDICAL_BED = "medical_bed",
    AUTODOC = "autodoc",
    TURRET = "turret",
    GENERATOR = "generator",
    BIO_SCANNER = "bio_scanner"
}
export interface GridCoordinateDTO {
    readonly x: number;
    readonly y: number;
    readonly z: number;
}
export interface CellDTO {
    readonly type: CellType;
    readonly roomId?: string;
    readonly characterId?: string;
    readonly inventoryIds: ReadonlyArray<string>;
}
export interface RoomDTO {
    readonly id: string;
    readonly tag: string;
    readonly bounds: {
        readonly x: number;
        readonly y: number;
        readonly z: number;
        readonly w: number;
        readonly h: number;
    };
    readonly threatLevel: ThreatLevel;
    readonly revealedToPlayerIds: ReadonlyArray<string>;
}
export interface GameStateDTO {
    readonly mapDimensions: {
        readonly width: number;
        readonly height: number;
    };
    readonly cells: Record<string, CellDTO>;
    readonly rooms: Record<string, RoomDTO>;
    readonly globalHeat: number;
}
export declare class GameStateParser {
    /**
     * Validates raw JSON into a strict GameStateDTO using the Result pattern.
     * Enforces Contract-First integrity.
     */
    static parse(raw: unknown): Result<GameStateDTO, Error>;
}
//# sourceMappingURL=GameStateDTO.d.ts.map