import { Result } from '../shared/Result';
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
export declare function calculateSNR(command: SnrCommand): Result<SnrSuccess, SnrFailure>;
export interface StressCommand {
    currentStress: number;
}
export interface StressSuccess {
    state: 'STABLE' | 'PSYCHOTIC';
    triggerHapticFeedback: boolean;
}
export declare function checkCyberpsychosis(command: StressCommand): Result<StressSuccess, never>;
//# sourceMappingURL=AcousticPhysics.d.ts.map