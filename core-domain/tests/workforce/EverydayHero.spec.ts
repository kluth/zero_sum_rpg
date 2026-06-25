import { EverydayHero } from '../../src/workforce/EverydayHero';
import { Nervenkostuem } from '../../src/workforce/Nervenkostuem';
import { BurnoutMeter } from '../../src/workforce/BurnoutMeter';
import { KoffeinPegel } from '../../src/workforce/KoffeinPegel';
import { SchichtTasche } from '../../src/workforce/SchichtTasche';
import { JobTag } from '../../src/workforce/JobTag';

describe('EverydayHero', () => {
  const createTestHero = () => {
    const nk = (Nervenkostuem.create(100) as any).value;
    const bm = (BurnoutMeter.create(0) as any).value;
    const kp = (KoffeinPegel.create(100) as any).value;
    const st = (SchichtTasche.create(5) as any).value;
    
    return EverydayHero.create('hero-1', 'Test Hero', nk, bm, kp, st, []);
  };

  it('should initialize correctly', () => {
    const heroResult = createTestHero();
    expect(heroResult.isSuccess()).toBe(true);
    if (heroResult.isSuccess()) {
      expect(heroResult.value.getId()).toBe('hero-1');
      expect(heroResult.value.getName()).toBe('Test Hero');
    }
  });

  it('should be able to add a JobTag', () => {
    const heroResult = createTestHero();
    if (!heroResult.isSuccess()) return;
    const hero = heroResult.value;

    const tag = (JobTag.create('Pflegekraft') as any).value;
    const updatedHero = hero.addJobTag(tag);
    
    expect(updatedHero.hasJobTag('Pflegekraft')).toBe(true);
  });
});
