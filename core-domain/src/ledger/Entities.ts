export interface PlayerCharacter {
  id: string;
  hp: number;
  maxHp: number;
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
