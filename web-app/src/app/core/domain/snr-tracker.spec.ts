import { SnrTracker, ThreatLevel } from './snr-tracker';

describe('SNR Tracker Domain', () => {
  let tracker: SnrTracker;

  beforeEach(() => {
    tracker = new SnrTracker();
  });

  it('should initialize with SNR 0', () => {
    expect(tracker.getSnr()).toBe(0);
    expect(tracker.getThreatLevel()).toBe(ThreatLevel.NORMAL);
  });

  it('should increase SNR correctly', () => {
    const result = tracker.increaseSnr(5);
    expect(result.isSuccess).toBeTrue();
    expect(tracker.getSnr()).toBe(5);
  });

  it('should not allow negative increases', () => {
    const result = tracker.increaseSnr(-2);
    expect(result.isFailure).toBeTrue();
    expect(tracker.getSnr()).toBe(0);
  });

  it('should decrease SNR but not below 0', () => {
    tracker.increaseSnr(10);
    const successResult = tracker.decreaseSnr(4);
    expect(successResult.isSuccess).toBeTrue();
    expect(tracker.getSnr()).toBe(6);

    const failResult = tracker.decreaseSnr(10);
    expect(failResult.isFailure).toBeTrue();
    expect(tracker.getSnr()).toBe(6); // should remain unchanged
  });

  it('should calculate the correct threat level based on SNR thresholds', () => {
    expect(tracker.getThreatLevel()).toBe(ThreatLevel.NORMAL);
    
    tracker.increaseSnr(10);
    expect(tracker.getThreatLevel()).toBe(ThreatLevel.ELEVATED);
    
    tracker.increaseSnr(10);
    expect(tracker.getThreatLevel()).toBe(ThreatLevel.LOCKDOWN);

    tracker.increaseSnr(10);
    expect(tracker.getThreatLevel()).toBe(ThreatLevel.SWAT);
  });
});
