import { Result } from '../shared/Result';
import { PlayerCharacter, CivilianEntity, TraumaEvent } from './Entities';
export interface EmergencyHealCommand {
    playerId: string;
    requestedHp: number;
    player: PlayerCharacter;
    availableCivilians: CivilianEntity[];
}
export interface EmergencyHealSuccess {
    actualHpRestored: number;
    newCharacterHp: number;
    generatedCasualty: TraumaEvent;
}
export interface EmergencyHealFailure {
    code: 'ERROR_CODE_INSUFFICIENT_CIVILIANS' | 'ERROR_CODE_PLAYER_DEAD' | 'ERROR_CODE_OVERHEAL';
    message: string;
}
export declare function executeEmergencyHeal(command: EmergencyHealCommand): Result<EmergencyHealSuccess, EmergencyHealFailure>;
//# sourceMappingURL=EmergencyHeal.d.ts.map