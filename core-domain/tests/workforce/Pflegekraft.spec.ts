import { Pflegekraft } from '../../src/workforce/Pflegekraft';
import { Nervenkostuem } from '../../src/workforce/Nervenkostuem';
import { BurnoutMeter } from '../../src/workforce/BurnoutMeter';
import { KoffeinPegel } from '../../src/workforce/KoffeinPegel';

describe('Pflegekraft', () => {
  const createPflegekraft = (focus: number = 100) => {
    const nr = Nervenkostuem.create(100);
    const br = BurnoutMeter.create(0);
    const kr = KoffeinPegel.create(focus);
    
    if (nr.isSuccess() && br.isSuccess() && kr.isSuccess()) {
      return Pflegekraft.create('nurse-1', 'Nurse Joy', nr.value, br.value, kr.value);
    }
    throw new Error('Failed to create dependencies');
  };

  it('should create successfully', () => {
    const nurse = createPflegekraft();
    expect(nurse.id).toBe('nurse-1');
    expect(nurse.name).toBe('Nurse Joy');
  });

  it('should execute triage successfully', () => {
    const nurse = createPflegekraft();
    const result = nurse.triagePatient('pat-1');
    
    expect(result.isSuccess()).toBe(true);
    expect(nurse.getKoffeinPegel().getValue()).toBe(80); // 100 - 20
    expect(nurse.getBurnoutMeter().getValue()).toBe(10); // 0 + 10
  });

  it('should fail triage if not enough focus', () => {
    const nurse = createPflegekraft(10); // Only 10 focus
    const result = nurse.triagePatient('pat-2');
    
    expect(result.isFailure()).toBe(true);
    if (result.isFailure()) {
      expect(result.error).toContain('Triage fehlgeschlagen:');
    }
  });

  it('should execute pausenZigarettenDiplomatie successfully', () => {
    const nurse = createPflegekraft(20);
    nurse.applyStress(50); // Setup some stress
    
    const result = nurse.pausenZigarettenDiplomatie();
    
    expect(result.isSuccess()).toBe(true);
    expect(nurse.getNervenkostuem().getValue()).toBe(90); // 100 - 10
    expect(nurse.getBurnoutMeter().getValue()).toBe(20); // 50 - 30
    expect(nurse.getKoffeinPegel().getValue()).toBe(60); // 20 + 40
  });
});
