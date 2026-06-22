"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeEmergencyHeal = executeEmergencyHeal;
const Result_1 = require("../shared/Result");
const Telemetry_1 = require("../shared/Telemetry");
function executeEmergencyHeal(command) {
    const span = Telemetry_1.tracer.startSpan('executeEmergencyHeal');
    span.setAttribute('playerId', command.playerId);
    span.setAttribute('requestedHp', command.requestedHp);
    const result = _executeEmergencyHeal(command);
    if (result.isSuccess()) {
        span.addEvent('TraumaGenerated', { civilianId: result.value.generatedCasualty.civilianId });
        span.setStatus({ code: 'OK' });
    }
    else {
        span.setStatus({ code: 'ERROR', message: result.error.message });
    }
    span.end();
    return result;
}
function _executeEmergencyHeal(command) {
    const { player, requestedHp, availableCivilians } = command;
    if (player.isDead || player.stats.hp_current <= 0) {
        return (0, Result_1.failure)({ code: 'ERROR_CODE_PLAYER_DEAD', message: 'Player is already dead.' });
    }
    if (player.stats.hp_current >= player.stats.hp_max) {
        return (0, Result_1.failure)({ code: 'ERROR_CODE_OVERHEAL', message: 'Player is already at max HP.' });
    }
    const aliveCivilians = availableCivilians.filter(c => c.isAlive && c.lifeSupport > 0);
    if (aliveCivilians.length === 0) {
        return (0, Result_1.failure)({ code: 'ERROR_CODE_INSUFFICIENT_CIVILIANS', message: 'No civilians left to drain.' });
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
    const casualtyEvent = {
        eventId: `trauma-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        civilianId: targetCivilian.id,
        civilianName: targetCivilian.name,
        lifeSupportDrained: actualHeal,
        timestamp: new Date()
    };
    return (0, Result_1.success)({
        actualHpRestored: actualHeal,
        newCharacterHp: player.stats.hp_current + actualHeal,
        generatedCasualty: casualtyEvent
    });
}
//# sourceMappingURL=EmergencyHeal.js.map