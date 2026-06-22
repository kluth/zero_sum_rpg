import { Result, success, failure } from '../shared/Result';
import { tracer } from '../shared/Telemetry';

export interface SnrCommand {
  sourceDb: number;
  distanceMeters: number;
  ambientDb: number;
}

export interface SnrSuccess {
  receivedDb: number;
  snr: number;
  isDetected: boolean;
}

export interface SnrFailure {
  code: 'ERROR_INVALID_DISTANCE';
  message: string;
}

export function calculateSNR(command: SnrCommand): Result<SnrSuccess, SnrFailure> {
  const span = tracer.startSpan('calculateSNR');
  span.setAttribute('sourceDb', command.sourceDb);
  span.setAttribute('distanceMeters', command.distanceMeters);

  if (command.distanceMeters <= 0) {
    span.setStatus({ code: 'ERROR', message: 'Distance must be > 0' });
    span.end();
    return failure({ code: 'ERROR_INVALID_DISTANCE', message: 'Distance must be > 0' });
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

  return success({
    receivedDb,
    snr,
    isDetected
  });
}

export interface StressCommand {
  currentStress: number;
}

export interface StressSuccess {
  state: 'STABLE' | 'PSYCHOTIC';
  triggerHapticFeedback: boolean;
}

export function checkCyberpsychosis(command: StressCommand): Result<StressSuccess, never> {
  const span = tracer.startSpan('checkCyberpsychosis');
  span.setAttribute('currentStress', command.currentStress);

  const CYBERPSYCHOSIS_THRESHOLD = 75;
  
  let resultState: 'STABLE' | 'PSYCHOTIC' = 'STABLE';
  let triggerHaptic = false;

  if (command.currentStress > CYBERPSYCHOSIS_THRESHOLD) {
    resultState = 'PSYCHOTIC';
    triggerHaptic = true;
  }

  span.addEvent('StateEvaluated', { state: resultState, triggerHaptic });
  span.setStatus({ code: 'OK' });
  span.end();

  return success({
    state: resultState,
    triggerHapticFeedback: triggerHaptic
  });
}

