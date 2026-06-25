import { ResolutionEngine, DegreeOfSuccess } from '../../src/ttrpg/ResolutionEngine';
import { EverydayHero } from '../../src/workforce/EverydayHero';
import { JobTag } from '../../src/workforce/JobTag';
import { DynamicBonus } from '../../src/workforce/DynamicBonus';
import { Nervenkostuem } from '../../src/workforce/Nervenkostuem';
import { BurnoutMeter } from '../../src/workforce/BurnoutMeter';
import { KoffeinPegel } from '../../src/workforce/KoffeinPegel';
import { SchichtTasche } from '../../src/workforce/SchichtTasche';

describe('ResolutionEngine', () => {
  it('should resolve with EverydayHero and DynamicBonus instead of hardcoded classes', () => {
    const nk = (Nervenkostuem.create(100) as any).value;
    const bm = (BurnoutMeter.create(0) as any).value;
    const kp = (KoffeinPegel.create(100) as any).value;
    const st = (SchichtTasche.create(5) as any).value;
    const tag = (JobTag.create('Pflegekraft') as any).value;
    
    const hero = (EverydayHero.create('hero-1', 'Test', nk, bm, kp, st, [tag]) as any).value;
    const bonus = (DynamicBonus.create('Wundversorgung', 2) as any).value;
    
    const result = ResolutionEngine.evaluateFreeform({
      hero,
      skill: 'Wundversorgung',
      difficultyPenalty: 1,
      bonuses: [bonus]
    }, () => 0.5); // roll is 11

    // bonus = 2, penalty = 1 -> final = 11 + 2 - 1 = 12 (MIXED_SUCCESS)
    expect(result.finalTotal).toBe(12);
    expect(result.degree).toBe(DegreeOfSuccess.MIXED_SUCCESS);
  });
});
