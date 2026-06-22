import { EmergencyHealCommand, executeEmergencyHeal } from '../../src/ledger/EmergencyHeal';
import { CivilianEntity, PlayerCharacter } from '../../src/ledger/Entities';

describe('ZeroSumLedger: Emergency Heal', () => {
  it('should restore HP and generate a trauma event when civilians are available', () => {
    const player: PlayerCharacter = { id: 'p1', hp: 50, maxHp: 100, isDead: false };
    const civilians: CivilianEntity[] = [
      { id: 'c1', name: 'Nakamura', lifeSupport: 100, isAlive: true }
    ];

    const command: EmergencyHealCommand = {
      playerId: 'p1',
      requestedHp: 25,
      player,
      availableCivilians: civilians
    };

    const result = executeEmergencyHeal(command);

    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      expect(result.value.actualHpRestored).toBe(25);
      expect(result.value.newCharacterHp).toBe(75);
      expect(result.value.generatedCasualty.civilianId).toBe('c1');
      expect(result.value.generatedCasualty.lifeSupportDrained).toBe(25);
    }
  });

  it('should return Failure ERROR_CODE_INSUFFICIENT_CIVILIANS if no civilians are alive', () => {
    const player: PlayerCharacter = { id: 'p1', hp: 50, maxHp: 100, isDead: false };
    const command: EmergencyHealCommand = {
      playerId: 'p1',
      requestedHp: 25,
      player,
      availableCivilians: [] // No civilians
    };

    const result = executeEmergencyHeal(command);

    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.error.code).toBe('ERROR_CODE_INSUFFICIENT_CIVILIANS');
    }
  });

  it('should return Failure ERROR_CODE_PLAYER_DEAD if player is already dead', () => {
    const player: PlayerCharacter = { id: 'p1', hp: 0, maxHp: 100, isDead: true };
    const civilians: CivilianEntity[] = [{ id: 'c1', name: 'Nakamura', lifeSupport: 100, isAlive: true }];
    const command: EmergencyHealCommand = {
      playerId: 'p1',
      requestedHp: 25,
      player,
      availableCivilians: civilians
    };

    const result = executeEmergencyHeal(command);

    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.error.code).toBe('ERROR_CODE_PLAYER_DEAD');
    }
  });
});
