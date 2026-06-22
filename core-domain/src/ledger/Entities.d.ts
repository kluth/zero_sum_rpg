export type ConditionEnum = 'CYBERPSYCHOSIS' | 'COMPROMISED' | 'BLEEDING' | 'DEAFENED' | 'STEALTH';
export interface FlatStats {
    hp_current: number;
    hp_max: number;
    stress_current: number;
    stress_max: number;
    stealth_base: number;
    stealth_total: number;
    snr_threshold_base: number;
    snr_threshold_total: number;
}
export interface Modifier {
    mod_id: string;
    target_stat: 'stealth' | 'snr_threshold' | 'hp_max';
    value: number;
    source: string;
}
export interface PlayerCharacter {
    id: string;
    name: string;
    role: string;
    stats: FlatStats;
    active_conditions: ConditionEnum[];
    modifiers: Modifier[];
    isDead: boolean;
}
export interface CivilianEntity {
    id: string;
    name: string;
    lifeSupport: number;
    isAlive: boolean;
}
export interface TraumaEvent {
    eventId: string;
    civilianId: string;
    civilianName: string;
    lifeSupportDrained: number;
    timestamp: Date;
}
//# sourceMappingURL=Entities.d.ts.map