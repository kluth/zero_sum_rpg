"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateSNR = calculateSNR;
exports.checkCyberpsychosis = checkCyberpsychosis;
const Result_1 = require("../shared/Result");
const Telemetry_1 = require("../shared/Telemetry");
function calculateSNR(command) {
    const span = Telemetry_1.tracer.startSpan('calculateSNR');
    span.setAttribute('sourceDb', command.sourceDb);
    span.setAttribute('distanceMeters', command.distanceMeters);
    if (command.distanceMeters <= 0) {
        span.setStatus({ code: 'ERROR', message: 'Distance must be > 0' });
        span.end();
        return (0, Result_1.failure)({ code: 'ERROR_INVALID_DISTANCE', message: 'Distance must be > 0' });
    }
    // Inverse Square Law: Sound drops by 20 * log10(distance)
    const dropOff = 20 * Math.log10(command.distanceMeters);
    const receivedDb = command.sourceDb - dropOff;
    const snr = receivedDb - command.ambientDb;
    // Basic threshold logic: If SNR > 0, the signal is above the noise floor.
    const isDetected = snr > 0;
    span.addEvent('SNROutput', { snr, isDetected });
    span.setStatus({ code: 'OK' });
    span.end();
    return (0, Result_1.success)({
        receivedDb,
        snr,
        isDetected
    });
}
function checkCyberpsychosis(command) {
    const span = Telemetry_1.tracer.startSpan('checkCyberpsychosis');
    span.setAttribute('currentStress', command.currentStress);
    const CYBERPSYCHOSIS_THRESHOLD = 75;
    let resultState = 'STABLE';
    let triggerHaptic = false;
    if (command.currentStress > CYBERPSYCHOSIS_THRESHOLD) {
        resultState = 'PSYCHOTIC';
        triggerHaptic = true;
    }
    span.addEvent('StateEvaluated', { state: resultState, triggerHaptic });
    span.setStatus({ code: 'OK' });
    span.end();
    return (0, Result_1.success)({
        state: resultState,
        triggerHapticFeedback: triggerHaptic
    });
}
//# sourceMappingURL=AcousticPhysics.js.map