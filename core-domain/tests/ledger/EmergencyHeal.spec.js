"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EmergencyHeal_1 = require("../../src/ledger/EmergencyHeal");
describe('ZeroSumLedger: Emergency Heal', () => {
    const createMockPlayer = (hp_current, hp_max, isDead) => ({
        id: 'p1',
        name: 'Test Player',
        role: 'Solo',
        stats: {
            hp_current,
            hp_max,
            stress_current: 0,
            stress_max: 20,
            stealth_base: 10,
            stealth_total: 10,
            snr_threshold_base: 10,
            snr_threshold_total: 10
        },
        active_conditions: [],
        modifiers: [],
        isDead
    });
    it('should restore HP and generate a trauma event when civilians are available', () => {
        const player = createMockPlayer(10, 20, false);
        const civilians = [
            { id: 'c1', name: 'Nakamura', lifeSupport: 20, isAlive: true }
        ];
        const command = {
            playerId: 'p1',
            requestedHp: 5,
            player,
            availableCivilians: civilians
        };
        const result = (0, EmergencyHeal_1.executeEmergencyHeal)(command);
        expect(result.isSuccess()).toBe(true);
        if (result.isSuccess()) {
            expect(result.value.actualHpRestored).toBe(5);
            expect(result.value.newCharacterHp).toBe(15);
            expect(result.value.generatedCasualty.civilianId).toBe('c1');
            expect(result.value.generatedCasualty.lifeSupportDrained).toBe(5);
        }
    });
    it('should return Failure ERROR_CODE_INSUFFICIENT_CIVILIANS if no civilians are alive', () => {
        const player = createMockPlayer(10, 20, false);
        const command = {
            playerId: 'p1',
            requestedHp: 5,
            player,
            availableCivilians: [] // No civilians
        };
        const result = (0, EmergencyHeal_1.executeEmergencyHeal)(command);
        expect(result.isFailure()).toBe(true);
        if (result.isFailure()) {
            expect(result.error.code).toBe('ERROR_CODE_INSUFFICIENT_CIVILIANS');
        }
    });
    it('should return Failure ERROR_CODE_PLAYER_DEAD if player is already dead', () => {
        const player = createMockPlayer(0, 20, true);
        const civilians = [{ id: 'c1', name: 'Nakamura', lifeSupport: 20, isAlive: true }];
        const command = {
            playerId: 'p1',
            requestedHp: 5,
            player,
            availableCivilians: civilians
        };
        const result = (0, EmergencyHeal_1.executeEmergencyHeal)(command);
        expect(result.isFailure()).toBe(true);
        if (result.isFailure()) {
            expect(result.error.code).toBe('ERROR_CODE_PLAYER_DEAD');
        }
    });
});
//# sourceMappingURL=EmergencyHeal.spec.js.map