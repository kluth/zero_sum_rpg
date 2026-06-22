export type ConditionEnum = 'CYBERPSYCHOSIS' | 'COMPROMISED' | 'BLEEDING' | 'DEAFENED' | 'STEALTH';

export interface FlatStats {
  hp_current: number;       // Bound: 0-20
  hp_max: number;           // Bound: 20
  stress_current: number;   // Bound: 0-20
  stress_max: number;       // Bound: 20
  stealth_base: number;     // Bound: 1-20
  stealth_total: number;    // Bound: 1-20
  snr_threshold_base: number; // Bound: 1-20
  snr_threshold_total: number; // Bound: 1-20
}

export interface Modifier {
  mod_id: string;
  target_stat: 'stealth' | 'snr_threshold' | 'hp_max';
  value: number; // Bound: -3 to 3
  source: string;
}

export interface PlayerCharacter {
  id: string;
  name: string;
  role: string;
  stats: FlatStats;
  active_conditions: ConditionEnum[];
  modifiers: Modifier[]; // Only for UI tooltips. Math is pre-computed on backend.
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
