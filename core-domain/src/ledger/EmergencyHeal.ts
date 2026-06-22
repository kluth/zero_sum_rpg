import { Result, success, failure } from '../shared/Result';
import { PlayerCharacter, CivilianEntity, TraumaEvent } from './Entities';
import { tracer } from '../shared/Telemetry';

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

export function executeEmergencyHeal(
  command: EmergencyHealCommand
): Result<EmergencyHealSuccess, EmergencyHealFailure> {
  const span = tracer.startSpan('executeEmergencyHeal');
  span.setAttribute('playerId', command.playerId);
  span.setAttribute('requestedHp', command.requestedHp);

  const result = _executeEmergencyHeal(command);

  if (result.isSuccess()) {
    span.addEvent('TraumaGenerated', { civilianId: result.value.generatedCasualty.civilianId });
    span.setStatus({ code: 'OK' });
  } else {
    span.setStatus({ code: 'ERROR', message: result.error.message });
  }
  
  span.end();
  return result;
}

function _executeEmergencyHeal(
  command: EmergencyHealCommand
): Result<EmergencyHealSuccess, EmergencyHealFailure> {
  const { player, requestedHp, availableCivilians } = command;

  if (player.isDead || player.stats.hp_current <= 0) {
    return failure({ code: 'ERROR_CODE_PLAYER_DEAD', message: 'Player is already dead.' });
  }

  if (player.stats.hp_current >= player.stats.hp_max) {
    return failure({ code: 'ERROR_CODE_OVERHEAL', message: 'Player is already at max HP.' });
  }

  const aliveCivilians = availableCivilians.filter(c => c.isAlive && c.lifeSupport > 0);
  if (aliveCivilians.length === 0) {
    return failure({ code: 'ERROR_CODE_INSUFFICIENT_CIVILIANS', message: 'No civilians left to drain.' });
  }

  // Domain Rule: Equivalent Exchange
  // We randomly select a civilian (or take the first available for determinism in this pure function, 
  // random selection should ideally be passed in or injected)
  const targetCivilian = aliveCivilians[0]; 
  
  // Cap the requested heal by the player's max HP
  const missingHp = player.stats.hp_max - player.stats.hp_current;
  let actualHeal = Math.min(requestedHp, missingHp);

  // Cap the heal by the civilian's remaining life support
  actualHeal = Math.min(actualHeal, targetCivilian.lifeSupport);

  const casualtyEvent: TraumaEvent = {
    eventId: `trauma-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    civilianId: targetCivilian.id,
    civilianName: targetCivilian.name,
    lifeSupportDrained: actualHeal,
    timestamp: new Date()
  };

  return success({
    actualHpRestored: actualHeal,
    newCharacterHp: player.stats.hp_current + actualHeal,
    generatedCasualty: casualtyEvent
  });
}
