import { AcousticImpedance } from '../../src/acoustics/AcousticImpedance';

describe('AcousticImpedance Value Object', () => {
  it('should create a valid AcousticImpedance (dB loss per meter)', () => {
    const result = AcousticImpedance.create(5.5);
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.lossPerMeter).toBe(5.5);
    }
  });

  it('should fail when impedance is negative', () => {
    const result = AcousticImpedance.create(-1.0);
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.message).toBe('AcousticImpedance cannot be negative');
    }
  });
});
