import { calculateSNR, checkCyberpsychosis } from '../../src/psychophysics/AcousticPhysics';

describe('Psychophysics: Acoustic & Stress Models', () => {
  describe('calculateSNR', () => {
    it('should correctly calculate SNR using Inverse Square Law', () => {
      // Gunshot (140dB) at distance 10 meters, ambient 40dB
      // Simplified ISL drop: Drop = 20 * log10(Distance)
      // At 10m: Drop = 20 * 1 = 20dB
      // Received = 140 - 20 = 120dB
      // SNR = 120 - 40 = 80
      const result = calculateSNR({
        sourceDb: 140,
        distanceMeters: 10,
        ambientDb: 40
      });

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(Math.round(result.value.snr)).toBe(80);
        expect(result.value.isDetected).toBe(true); // Assuming threshold > 0 is detected
      }
    });

    it('should return failure if distance is <= 0', () => {
      const result = calculateSNR({ sourceDb: 100, distanceMeters: 0, ambientDb: 40 });
      expect(result.isFailure()).toBe(true);
      if (result.isFailure()) {
        expect(result.error.code).toBe('ERROR_INVALID_DISTANCE');
      }
    });
  });

  describe('checkCyberpsychosis', () => {
    it('should trigger Haptic Feedback Signal when stress crosses 75', () => {
      const result = checkCyberpsychosis({ currentStress: 76 });
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value.state).toBe('PSYCHOTIC');
        expect(result.value.triggerHapticFeedback).toBe(true);
      }
    });

    it('should remain stable when stress is <= 75', () => {
      const result = checkCyberpsychosis({ currentStress: 70 });
      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value.state).toBe('STABLE');
        expect(result.value.triggerHapticFeedback).toBe(false);
      }
    });
  });
});
